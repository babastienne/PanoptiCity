import math
import overpy

from django.contrib.gis.db import models
from django.contrib.gis.db.models.functions import Distance, Intersection, ClosestPoint
from django.contrib.gis.geos import Polygon, Point, LineString, MultiLineString
from django.core.validators import MaxValueValidator, MinValueValidator


MOUNT_CHOICES = {
    'wall': 'wall',
    'pole': 'pole',
    'ceiling': 'ceiling',
    'street_lamp': 'street_lamp',
    'building':'building',
    'traffic_signal': 'traffic_signal',
}

SURVEILLANCE_TYPE_CHOICES = {
    'camera': 'camera',
    'guard': 'guard',
    'ALPR': 'ALPR',
    'gunshot_detector': 'gunshot_detector',
}

SURVEILLANCE_CHOICES = {
    'indoor': 'indoor',
    'outdoor': 'outdoor',
    'public': 'public',
    'transportation': 'transportation',
    'traffic': 'traffic',
}

ZONE_CHOICES = {
    'town': 'town',
    'parking': 'parking',
    'atm': 'atm',
    'traffic': 'traffic',
    'shop': 'shop',
    'bank': 'bank',
    'building': 'building',
    'entrance': 'entrance',
    'street': 'street',
}

CAMERA_TYPE_CHOICES = {
    'fixed': 'fixed',
    'panning': 'panning',
    'dom': 'dom',
}


# Create your models here.
class Camera(models.Model):
    id = models.BigIntegerField(primary_key=True, blank=False)
    location = models.PointField(blank=False)
    mount = models.CharField(choices=MOUNT_CHOICES, blank=True)
    surveillance_type = models.CharField(choices=SURVEILLANCE_TYPE_CHOICES, default='camera', blank=True)
    surveillance = models.CharField(choices=SURVEILLANCE_CHOICES, blank=True)
    camera_type = models.CharField(choices=CAMERA_TYPE_CHOICES, blank=True)
    zone = models.CharField(choices=ZONE_CHOICES, blank=True)
    height = models.FloatField(blank=True, null=True)
    direction = models.IntegerField(blank=True, null=True, validators=[MaxValueValidator(360),MinValueValidator(0)])
    angle = models.IntegerField(blank=True, null=True, validators=[MaxValueValidator(360),MinValueValidator(0)])
    # focus = models.PolygonField(null=True)

    @property
    def color(self):
        if self.surveillance == 'public':
            return 'Red'
        elif self.surveillance == 'indoor':
            return 'Green'
        elif self.surveillance == 'outdoor':
            return 'Blue'
        return 'Black'
    
    @property
    def marker(self):
        if self.camera_type == 'fixed':
            return 'fixed' + self.color
        elif self.camera_type == 'panning':
            return 'panning' + self.color
        elif self.camera_type == 'dome':
            return 'dome' + self.color
        elif self.surveillance_type == 'guard':
            return 'guard' + self.color
        elif self.surveillance_type == 'ALPR' or self.surveillance in ['red_light', 'level_crossing', 'speed_camera']:
            return 'traffic'
        return 'cam' + self.color

    def compute_camera_direction(self):
        camera_direction = 90 - self.direction
        if camera_direction > 180:
            camera_direction -= 360
        elif camera_direction < -180:
            camera_direction += 360
        camera_direction = (camera_direction * 207986.0) / 11916720
        return camera_direction
    
    def compute_camera_height(self):
        height = 5  # default value
        if self.height:
            height = 1.5 if self.height < 1.5 else self.height
            height = 12 if self.height > 12 else self.height
        return height
    
    def compute_camera_angle(self):
        if self.angle:
            if abs(self.angle) <= 15:
                return 1
            else:
                return math.cos(((abs(self.angle) - 15) * 207986.0) / 11916720)
        else:
            return 1  # default angle
        
    def get_intersection_point_with_building(self, endOfVisionField):
        line_vision = LineString(self.location, endOfVisionField)  # Build a line between the camera and its end vision
        try:
            building_accross = Building.objects.filter(
                geom__intersects=line_vision
                ).exclude(
                    geom__touches=line_vision  # Exclude building if it only touches with one point of the line to match cases when camera is on wall
                ).annotate(
                    closest_intersection_point=ClosestPoint(Intersection("geom", line_vision), self.location)
                ).annotate(
                    distance=Distance("closest_intersection_point", self.location)  # Add field with distance between location and intersection point of the building
                ).order_by("distance").first()  # We sort by this distance so that new endOfVision is the closest to the camera
            if building_accross:
                endOfVisionField = building_accross.closest_intersection_point

        except Exception as e:
            # If this fails we keep the basic endOfVisionField computed initially
            raise e  # FIXME: Remove in production
        return endOfVisionField
    
    def compute_focus_dome(self):
        height = self.compute_camera_height()
        cameraIsIntoBuilding = Building.objects.filter(geom__contains=self.location).count()
        focus = []

        coefLat = (1.0 / math.cos(self.location.x * 3.14159265 / 180))
        
        for x in range(0, 63, 1):  # 6,3 ~= 2pi
            endOfVisionField = Point([
                self.location.x + 0.000063 * math.sin(x / 10) * height,
                self.location.y + 0.000063 * math.cos(x / 10) * coefLat * height,
            ])
            if not cameraIsIntoBuilding:  # If the camera is into a building we keep the default calculation mode
                endOfVisionField = self.get_intersection_point_with_building(endOfVisionField)
                if not endOfVisionField:
                    continue
            focus.append(endOfVisionField)
        focus.append(focus[0])

        return Polygon(focus)
    
    def compute_focus_fixed(self):
        direction = self.compute_camera_direction()
        height = self.compute_camera_height()
        angle = self.compute_camera_angle()

        cameraIsIntoBuilding = Building.objects.filter(geom__contains=self.location).count()

        focus = [self.location]
        coefLat = (1.0 / math.cos(self.location.x * 3.14159265 / 180))
        for x in range(-5, 5, 1):
            endOfVisionField = Point([
                self.location.x + 0.000063 * math.sin(direction + x / 10) * height * angle,
                self.location.y + 0.000063 * math.cos(direction + x / 10) * coefLat * height * angle,
            ])  # This point is the end of the field of vision of camera

            if not cameraIsIntoBuilding:  # If the camera is into a building we keep default focus calculation
                endOfVisionField = self.get_intersection_point_with_building(endOfVisionField)
                if not endOfVisionField:
                    continue

            focus.append(endOfVisionField)
        focus.append(focus[0])  # We close the polygon by adding again our first point (camera location)
        return Polygon(focus)

    def compute_focus(self):
        if self.camera_type == 'fixed' and self.direction is not None:
            return self.compute_focus_fixed()
        if self.camera_type == 'dome':
            return self.compute_focus_dome()
        return None
    
    # Temporary for development only
    @property
    def focus(self):
        return self.compute_focus()

    def save(self, *args, **kwargs):
        # self.focus = self.compute_focus()
        super(Camera, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Camera"
        verbose_name_plural = "Cameras"

class Building(models.Model):
    id = models.BigIntegerField(primary_key=True, blank=False)
    geom = models.PolygonField(blank=False)

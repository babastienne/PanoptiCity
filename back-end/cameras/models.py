import math

from django.contrib.gis.db import models
from django.contrib.gis.db.models.functions import Distance, Intersection, ClosestPoint
from django.contrib.gis.geos import Polygon, Point, LineString, MultiPolygon
from django.core.validators import MaxValueValidator, MinValueValidator


MOUNT_CHOICES = {
    "wall": "wall",
    "pole": "pole",
    "ceiling": "ceiling",
    "street_lamp": "street_lamp",
    "building": "building",
    "traffic_signal": "traffic_signal",
}

SURVEILLANCE_TYPE_CHOICES = {
    "camera": "camera",
    "guard": "guard",
    "ALPR": "ALPR",
    "gunshot_detector": "gunshot_detector",
}

SURVEILLANCE_CHOICES = {
    "indoor": "indoor",
    "outdoor": "outdoor",
    "public": "public",
    "transportation": "transportation",
    "traffic": "traffic",
    "red_light": "red_light",
    "level_crossing": "level_crossing",
    "speed_camera": "speed_camera",
}

ZONE_CHOICES = {
    "town": "town",
    "parking": "parking",
    "atm": "atm",
    "traffic": "traffic",
    "shop": "shop",
    "bank": "bank",
    "building": "building",
    "entrance": "entrance",
    "street": "street",
}

CAMERA_TYPE_CHOICES = {
    "fixed": "fixed",
    "panning": "panning",
    "dom": "dom",
}

LEVEL_COEFFICIENTS = {
    "identification": 1,       # By default the focus computed without any coef is the recognition one for 250ppm
    "recognition": 3.84615, # 3.84615 = Ratio between 250ppm and 65 ppm
    "observation": 10,      # 25 = Ratio between 250ppm and 25 ppm
}

SCENARIOS_COEFFICIENTS = {  # FIXME
    "best":0.51,
    "mean": 1.2,
    "worst": 3.1,
}

class ExteriorRing(models.functions.GeomOutputGeoFunc):
    function = "ST_ExteriorRing"


class Camera(models.Model):
    id = models.BigIntegerField(primary_key=True, blank=False)
    location = models.PointField(blank=False)
    mount = models.CharField(choices=MOUNT_CHOICES, blank=True)
    surveillance_type = models.CharField(
        choices=SURVEILLANCE_TYPE_CHOICES, default="camera", blank=True
    )
    surveillance = models.CharField(choices=SURVEILLANCE_CHOICES, blank=True)
    camera_type = models.CharField(choices=CAMERA_TYPE_CHOICES, blank=True)
    zone = models.CharField(choices=ZONE_CHOICES, blank=True)
    height = models.FloatField(blank=True, null=True)
    direction = models.IntegerField(
        blank=True, null=True, validators=[MaxValueValidator(360), MinValueValidator(0)]
    )
    angle = models.IntegerField(
        blank=True, null=True, validators=[MaxValueValidator(360), MinValueValidator(0)]
    )

    @property
    def color(self):
        if self.surveillance == "public":
            return "Red"
        elif self.surveillance == "indoor":
            return "Green"
        elif self.surveillance == "outdoor":
            return "Blue"
        return "Black"

    @property
    def marker(self):
        if self.camera_type == "fixed":
            return "fixed" + self.color
        elif self.camera_type == "panning":
            return "panning" + self.color
        elif self.camera_type == "dome":
            return "dome" + self.color
        elif self.surveillance_type == "guard":
            return "guard" + self.color
        elif self.surveillance_type == "ALPR" or self.surveillance in [
            "red_light",
            "level_crossing",
            "speed_camera",
        ]:
            return "traffic"
        return "cam" + self.color

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
        return 1 + height / 10

    def compute_camera_angle(self):
        if self.angle:
            if abs(self.angle) <= 15:
                return 1
            else:
                return math.cos(((abs(self.angle) - 15) * 207986.0) / 11916720)
        else:
            return 1  # default angle

    def get_intersection_point_with_building(
        self, end_of_vision_field, buildings_camera_is_into
    ):
        line_vision = LineString(
            self.location, end_of_vision_field
        )  # Build a line between the camera and its end vision
        try:
            intersection_field = "geom"
            buildings_accross = (
                Building.objects.filter(geom__intersects=line_vision)
                .exclude(
                    geom__touches=line_vision  # Exclude building if it only touches with one point of the line to match cases when camera is on wall
                )
            )
            if self.surveillance == "indoor":
                buildings_accross = buildings_accross.annotate(
                    boundary=ExteriorRing("geom")
                )
                intersection_field = "boundary"
            buildings_accross = (buildings_accross
                .annotate(
                    closest_intersection_point=ClosestPoint(
                        Intersection(intersection_field, line_vision), self.location
                    )
                )
                .annotate(
                    distance=Distance(
                        "closest_intersection_point", self.location
                    )  # Add field with distance between location and intersection point of the building
                )
            )
            if buildings_camera_is_into.count() and self.surveillance != "indoor":
                buildings_accross = buildings_accross.exclude(
                    geom__contains=self.location
                )  # We remove building the camera is into if it is not an indoor camera
            building_accross = buildings_accross.order_by(
                "distance"
            ).first()  # We sort by this distance so that new endOfVision is the closest to the camera
            if building_accross and building_accross.closest_intersection_point is not None:
                end_of_vision_field = building_accross.closest_intersection_point
        except Exception as e:
            raise e
            # If this fails we keep the basic end_of_vision_field computed initially
            pass
        return end_of_vision_field

    def compute_all_focus(self):
        for scenario in FOCUS_SCENARIOS_CHOICES:
            self.compute_specific_focus(scenario)

    def compute_specific_focus(self, scenario):
        levels_focus = None
        if self.camera_type == "fixed" and self.direction is not None:
            levels_focus = self.compute_multiple_focus(scenario, True, -7, 7)
        if self.camera_type in ["dome", "panning"]:
            levels_focus = self.compute_multiple_focus(scenario, False, 0, 63)  # 6.3 ~= 2pi
        if levels_focus:
            for level in FOCUS_LEVELS_CHOICES:
                focus, _ = CameraFocus.objects.get_or_create(
                    camera_id = self,
                    scenario = scenario,
                    level = level
                )
                focus.geom = levels_focus[level]
                focus.save()
        return None
    
    def compute_multiple_focus(self, scenario, fixed, min_range, max_range):
        buildings_camera_is_into = Building.objects.filter(geom__contains=self.location)
        polygons_focus = {}
        levels_focus = {
            'identification': [self.location] if fixed else [],
            'recognition': [self.location] if fixed else [],
            'observation': [self.location] if fixed else [],
        }
        previous_polygon = None

        for x in range(min_range, max_range, 1):
            for level in FOCUS_LEVELS_CHOICES:
                end_of_fov = Point(
                    [
                        self.location.x + self.compute_coefficient(x, scenario, level, cos=True, fixed=fixed),
                        self.location.y + self.compute_coefficient(x, scenario, level, cos=False, fixed=fixed),
                    ]
                )
                new_end_of_fov = self.get_intersection_point_with_building(
                    end_of_fov, buildings_camera_is_into
                )
                if not end_of_fov:
                    continue
                levels_focus[level].append(new_end_of_fov)
                if new_end_of_fov != end_of_fov:  # If different mean there is an obstacle on the way so don't need to compute further
                    if level in ['recognition', 'identification']:
                        levels_focus['observation'].append(new_end_of_fov)
                    if level == 'identification':
                        levels_focus['recognition'].append(new_end_of_fov)
                    break
                        
        for level in FOCUS_LEVELS_CHOICES:
            levels_focus[level].append(levels_focus[level][0])
            computed_polygon = Polygon(levels_focus[level])
            if previous_polygon:
                polygons_focus[level] = self.compute_diffs_polygons(computed_polygon, previous_polygon)
            else:
                polygons_focus[level] = MultiPolygon(computed_polygon)
            previous_polygon = computed_polygon
        
        return polygons_focus

    def compute_coefficient(self, x, scenario, level, cos=True, fixed=False):
        height = self.compute_camera_height()
        direction = self.compute_camera_direction() if fixed else 0
        coef = 0.00026 * height * LEVEL_COEFFICIENTS[level] * SCENARIOS_COEFFICIENTS[scenario]
        if cos:
            coefLat = 1.0 / math.cos(self.location.y * math.pi / 180)
            coef = coef * math.cos(direction + x / 10) * coefLat
        else:
            coef = coef * math.sin(direction + x / 10)
        if fixed:
            coef = coef * self.compute_camera_angle()
        return coef

    def compute_diffs_polygons(self, shapeA, shapeB):
        diff_recognition = shapeA - shapeB
        recognition_multipolygon = MultiPolygon()
        if type(diff_recognition) == Polygon:
            diff_recognition = MultiPolygon(diff_recognition)
        elif type(diff_recognition) != MultiPolygon:
            return recognition_multipolygon
        for polygon in diff_recognition:
            polygon.srid = 4326
            polygon.transform(3857)
            if polygon.area > 3:  # We keep only the polygons with area > 3m²
                polygon.transform(4326)
                recognition_multipolygon.append(polygon)
        return recognition_multipolygon

    def save(self, *args, **kwargs):
        self.compute_all_focus()
        super(Camera, self).save(*args, **kwargs)

    class Meta:
        verbose_name = "Camera"
        verbose_name_plural = "Cameras"


FOCUS_SCENARIOS_CHOICES = {
    "best": "Best case scenario",
    "mean": "Average",
    "worst": "Worst case scenario",
}

FOCUS_LEVELS_CHOICES = {
    "identification": "identification",
    "recognition": "recognition",
    "observation": "observation",
}

class CameraFocus(models.Model):
    camera_id = models.ForeignKey(Camera, on_delete=models.PROTECT)
    scenario = models.CharField(choices=FOCUS_SCENARIOS_CHOICES, blank=False)
    level = models.CharField(choices=FOCUS_LEVELS_CHOICES, blank=False)
    geom = models.MultiPolygonField(null=True)

    class Meta:
        unique_together = ('camera_id', 'scenario', 'level',)

class CameraTags(models.Model):
    camera_id = models.ForeignKey(Camera, on_delete=models.PROTECT)
    name = models.CharField(blank=True)
    value = models.CharField(blank=True)


class Building(models.Model):
    id = models.BigIntegerField(primary_key=True, blank=False)
    osm_id = models.BigIntegerField(blank=False, null=False)
    geom = models.PolygonField(blank=False)

import math

import mercantile
from cameras.constants import (BASE_COEFICIENT, CAMERA_ANGLE_MIN,
                               CAMERA_HEIGHT_DEFAULT, CAMERA_HEIGHT_MAX,
                               CAMERA_HEIGHT_MIN, LEVEL_COEFFICIENTS,
                               SCENARIOS_COEFFICIENTS, CameraTypeChoices,
                               FocusLevelChoices, FocusScenarioChoices,
                               MountChoices, SurveillanceChoices,
                               SurveillanceTypeChoices, ZoneChoices)
from cameras.services.fov_calculator import FOVCalculator
from django.contrib.gis.db import models
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import MultiPolygon, Polygon
from django.core.validators import MaxValueValidator, MinValueValidator


class ExteriorRing(models.functions.GeomOutputGeoFunc):
    function = "ST_ExteriorRing"


class Camera(models.Model):
    id = models.BigIntegerField(primary_key=True, blank=False)
    location = models.PointField(blank=False)
    mount = models.CharField(choices=MountChoices.choices, blank=True)
    surveillance_type = models.CharField(
        choices=SurveillanceTypeChoices.choices, default="camera", blank=True
    )
    surveillance = models.CharField(
        choices=SurveillanceChoices.choices, blank=True)
    camera_type = models.CharField(
        choices=CameraTypeChoices.choices, blank=True)
    zone = models.CharField(choices=ZoneChoices.choices, blank=True)
    height = models.FloatField(blank=True, null=True)
    direction = models.IntegerField(
        blank=True, null=True, validators=[MaxValueValidator(360), MinValueValidator(0)]
    )
    angle = models.IntegerField(
        blank=True, null=True, validators=[MaxValueValidator(360), MinValueValidator(0)]
    )
    # This field store the recognition + identification focus for the mean scenario which is the default focus
    focus = models.PolygonField(null=True)
    # Fields stored to improve computation performances
    max_fov_distance = models.FloatField(null=True)
    tile = models.CharField(max_length=15, db_index=True)

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
        """
        Compute and return the camera direction in radians
        """
        camera_direction = 90 - self.direction
        if camera_direction > 180:
            camera_direction -= 360
        elif camera_direction < -180:
            camera_direction += 360
        camera_direction = (camera_direction * math.pi) / 180
        return camera_direction

    def get_camera_height(self):
        """
        Return the camera height in meters with min and max limits
        Min = 1.5m (typical height of a person)
        Max = 20m
        """
        height = CAMERA_HEIGHT_DEFAULT  # default value
        if self.height:
            height = CAMERA_HEIGHT_MIN if self.height < CAMERA_HEIGHT_MIN else self.height
            height = CAMERA_HEIGHT_MAX if self.height > CAMERA_HEIGHT_MAX else self.height
        return height

    def compute_camera_height_coef(self):
        return 1 + self.get_camera_height() / 10

    def compute_camera_angle(self):
        """
        Compute and return the camera angle coefficient
        """
        if self.angle:
            if abs(self.angle) <= CAMERA_ANGLE_MIN:
                return 1
            else:
                return math.cos(((abs(self.angle) - CAMERA_ANGLE_MIN) * math.pi) / 180)
        else:
            return 1  # default angle

    def get_lat_coef(self):
        """
        Compute and return the latitude coefficient to use to adapt calculations for longitude axis
        Formula is : 1 / cos(latitude in radian)
        Used because in degrees the X-axis (Longitude) shrinks as we move away from equator
        """
        # Conversion in radian = x * math.pi / 180
        # Could use math.radians instead
        return 1.0 / math.cos(self.location.y * math.pi / 180)

    def get_max_fov_distance(self):
        """
        Compute and return the maximum distance in meters of the fov for fixed cameras tilted downwards
        """
        if self.camera_type == "fixed" and self.angle:
            if abs(self.angle) > CAMERA_ANGLE_MIN:
                return self.get_camera_height() / math.tan(((abs(self.angle) - CAMERA_ANGLE_MIN) * math.pi) / 180) * self.get_lat_coef()
        return None

    def get_neighboring_tiles(self):
        tile = mercantile.quadkey_to_tile(self.tile)
        list_tiles = [mercantile.quadkey(neighbor)
                      for neighbor in mercantile.neighbors(tile)]
        list_tiles.append(self.tile)
        return list_tiles

    def get_sorted_configurations(self):
        """
        Generates a list of all Scenario/Level combinations, calculated in meters,
        sorted from largest distance to smallest distance.
        """
        configs = []
        is_fixed = self.camera_type == "fixed"
        cam_key = 'fixed' if is_fixed else 'dome/ptz'

        # Base scalar calculation in Meters (approximated from original logic)
        # Original logic: base_coef * height * level * scenario * lat_coef(for deg)
        height_factor = self.compute_camera_height_coef()
        base_factor = BASE_COEFICIENT * height_factor

        # Angle tilt factor for fixed cameras
        angle_factor = self.compute_camera_angle()

        for scenario in FocusScenarioChoices.values:
            for level in FocusLevelChoices.values:
                scenario_coef = SCENARIOS_COEFFICIENTS[cam_key][scenario]
                level_coef = LEVEL_COEFFICIENTS[level]

                # Theoretical max distance in degrees
                dist_degrees = base_factor * level_coef * scenario_coef * angle_factor

                configs.append({
                    'scenario': scenario,
                    'level': level,
                    'dist_degrees': dist_degrees
                })

        # Sort the configurations from largest to smallest distance
        configs.sort(key=lambda x: x['dist_degrees'], reverse=True)
        return configs

    def compute_all_focus(self):
        """
        Main entry point. Orchestrates the computation using optimized geometric sorting.
        """
        # Get Sorted Configurations (in meters)
        configs = self.get_sorted_configurations()
        if not configs:
            # Should not happen
            return

        calculator = FOVCalculator(self)

        # Fetch buildings associated to the camera
        # We need the max possible distance to filter the DB query efficiently
        max_possible_dist = configs[0]['dist_degrees']
        nearby_buildings_qs = Building.objects.filter(
            tile__in=self.neighboring_tiles,
            geom__dwithin=(self.location, max_possible_dist)
        ).only('id', 'geom')

        # Annotate with distance to camera and order by distance ascending
        nearby_buildings_qs = nearby_buildings_qs.annotate(
            distance=Distance('geom', self.location, spheroid=True)
        ).order_by('distance')

        # Pre-calculate which buildings contains the camera (for exclusion logic)
        buildings_camera_is_into_ids = nearby_buildings_qs.filter(
            geom__contains=self.location
        ).values_list('id', flat=True)

        if self.surveillance == "indoor":
            nearby_buildings = nearby_buildings_qs.annotate(
                geom_ring=ExteriorRing('geom')
            ).values_list('id', 'geom_ring')
        else:
            nearby_buildings = nearby_buildings_qs.values_list('id', 'geom')

        # Compute raw polygons for each scenario/level (in 4326)
        raw_results = calculator.compute_fov_points(
            configs, nearby_buildings, buildings_camera_is_into_ids)

        # List that will contain all CameraFocus objects to create/update
        new_focus_objects = []

        # Process the raw results and create Polygons/MultiPolygons with difference logic
        for scenario in FocusScenarioChoices.values:
            previous_polygon = None

            # Important: iterate levels from smallest (identification) -> largest (observation) for the diff logic
            for level in ["identification", "recognition", "observation"]:
                points_list = raw_results[scenario][level]

                if len(points_list) < 3:
                    continue  # Not a valid polygon

                # Close the ring/polygon if not already closed
                if points_list[0] != points_list[-1]:
                    points_list.append(points_list[0])

                # Create Polygon in 4326
                poly_4326 = Polygon(points_list, srid=4326)

                # Fallback for empty/invalid
                if not poly_4326.valid or poly_4326.area == 0.0:
                    # In somes cases (indoor cameras attached to walls, cameras attached to walls pointed toward building)
                    # the computed polygons are empty. To display at least something we compute fov without buildings
                    # To do so we buffer the location with the distance for this scenario/level
                    dist_degrees = next(
                        (c['dist_degrees'] for c in configs if c['scenario'] == scenario and c['level'] == level), 0)
                    if dist_degrees > 0:
                        # FIXME: This produces a oval shape on the map because of lat/lon distortion
                        poly_4326 = self.location.buffer(dist_degrees)
                    else:
                        continue  # Can't do anything

                # Calculate difference (to create donut shapes)
                final_geom = None
                if previous_polygon:
                    # Subtract previous (smaller) from current (larger)
                    final_geom = calculator.compute_diffs_polygons(
                        poly_4326, previous_polygon)
                else:
                    # First one (identification)
                    final_geom = MultiPolygon(poly_4326)

                # Update previous for next iteration
                previous_polygon = poly_4326

                if scenario == 'mean' and level == 'recognition':
                    # We need the full polygon 4326 for the 'focus' field, not the donut
                    # This is our "default focus", used for quick map display
                    self.focus = poly_4326

                if final_geom:
                    new_focus_objects.append(CameraFocus(
                        camera_id=self,
                        scenario=scenario,
                        level=level,
                        geom=final_geom
                    ))

        # Bulk write operation to DB
        if new_focus_objects:
            CameraFocus.objects.bulk_create(
                new_focus_objects,
                update_conflicts=True,
                update_fields=['geom'],
                unique_fields=['camera_id', 'scenario', 'level']
            )

    def generate_computed_fields(self):
        self.max_fov_distance = self.get_max_fov_distance()
        self.neighboring_tiles = self.get_neighboring_tiles()
        if self.camera_type == "fixed" and (self.direction is not None):
            self.compute_all_focus()
        elif self.camera_type in ["dome", "panning"]:
            self.compute_all_focus()

    class Meta:
        verbose_name = "Camera"
        verbose_name_plural = "Cameras"


class CameraFocus(models.Model):
    camera_id = models.ForeignKey(Camera, on_delete=models.PROTECT)
    scenario = models.CharField(
        choices=FocusScenarioChoices.choices, blank=False)
    level = models.CharField(choices=FocusLevelChoices.choices, blank=False)
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
    tile = models.CharField(max_length=15, db_index=True)


class Tile(models.Model):
    id = models.CharField(max_length=15, primary_key=True, db_index=True)
    geom = models.PolygonField(blank=False, spatial_index=True, srid=4326)
    level = models.IntegerField(db_index=True)
    obj_count = models.IntegerField()

    def __str__(self):
        return f"Tile {self.id} (L{self.level}) - {self.obj_count} objects"

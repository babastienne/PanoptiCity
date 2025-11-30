import math

from cameras.constants import FocusLevelChoices, FocusScenarioChoices
from django.contrib.gis.geos import (LineString, MultiLineString, MultiPoint,
                                     MultiPolygon, Point, Polygon)


class FOVCalculator():
    def __init__(self, camera):
        self.camera = camera

    def compute_diffs_polygons(self, shape_a, shape_b):
        """
        Subtracts shape_b from shape_a. Both inputs are in 4326.
        Returns MultiPolygon in 4326.
        """
        if not shape_a.valid:
            shape_a = shape_a.simplify()
        if not shape_b.valid:
            shape_b = shape_b.simplify()

        diff = shape_a - shape_b

        result_poly = MultiPolygon()

        if isinstance(diff, Polygon):
            diff = MultiPolygon(diff)

        if isinstance(diff, MultiPolygon):
            for polygon in diff:
                polygon.srid = 4326
                # We only want the polygons with area > 3m²...
                # but area in 4326 is in square degrees
                # 1 sq degree ~ 1.2e10 sq meters.
                # 3 sq meters is approx 2.4e-10 sq degrees.
                if polygon.area > 2.4e-10:
                    result_poly.append(polygon)
        return result_poly

    def compute_fov_points(self, sorted_configs, buildings, buildings_camera_is_into_ids):
        """
        Core logic to compute each ray of the FOV of the camera and check for intersections
        with buildings. Returns a nested dictionary of points for each scenario/level.
        """
        # Initialize results structure
        results = {s: {l: [] for l in FocusLevelChoices.values}
                   for s in FocusScenarioChoices.values}
        origin = self.camera.location

        # Determine angular range
        is_fixed = self.camera.camera_type == "fixed"
        if is_fixed and self.camera.direction is not None:
            # -7 to 7 = 15 iterations ~= 85°
            rng = range(-7, 8)
        elif self.camera.camera_type in ["dome", "panning"]:
            # 6.3 ~= 2pi = 360°
            rng = range(0, 63)
        else:
            # Should not happen because of previous check in the compute_focus method
            rng = []

        camera_dir_rad = self.camera.compute_camera_direction() if is_fixed else 0
        camera_lat_coef = self.camera.get_lat_coef()
        # The largest possible distance
        max_dist_degrees = sorted_configs[0]['dist_degrees']

        for x in rng:
            # -- Compute end of ray point and create LineString representing the ray --
            angle_rad = camera_dir_rad + (x / 10.0)

            cos_a = math.cos(angle_rad)
            sin_a = math.sin(angle_rad)

            # Convert meters vector to degrees vector
            vec_x_deg = max_dist_degrees * cos_a * camera_lat_coef
            vec_y_deg = max_dist_degrees * sin_a

            dest_x = origin.x + vec_x_deg
            dest_y = origin.y + vec_y_deg

            ray_geom = LineString(origin, Point(
                dest_x, dest_y, srid=4326), srid=4326)

            # -- Check intersection with buildings --
            # We track the hit ratio (0.0 to 1.0) to determine if we hit a building and at what distance
            closest_hit_ratio = 1.0  # 1.0 means no hit (full distance)

            for b_id, real_geom in buildings:
                # We skip buildings the camera is into if it is not an indoor camera
                if self.camera.surveillance != "indoor" and b_id in buildings_camera_is_into_ids:
                    continue

                # Fast check on geoms : We keep only buildings that intersect the line
                if real_geom.intersects(ray_geom):
                    # We skip touching buildings (camera mounted on wall but the ray is not directed to the wall)
                    if not real_geom.touches(ray_geom):
                        # This returns the part of the line inside/touching the building
                        intersection = ray_geom.intersection(real_geom)
                        # Logic to find closest point on intersection line
                        if not intersection.empty:
                            # Find closest point
                            hit_point = None
                            if isinstance(intersection, Point):
                                hit_point = intersection
                            elif isinstance(intersection, LineString):
                                hit_point = Point(
                                    intersection.coords[0], srid=4326)
                            elif isinstance(intersection, (MultiPoint, MultiLineString, MultiPolygon)):
                                closest_dist = None
                                for geom in intersection:
                                    candidate_point = None
                                    if isinstance(geom, Point):
                                        candidate_point = geom
                                    elif isinstance(geom, LineString):
                                        candidate_point = Point(
                                            geom.coords[0], srid=4326)
                                    if candidate_point:
                                        dist = origin.distance(candidate_point)
                                        if closest_dist is None or dist < closest_dist:
                                            closest_dist = dist
                                            hit_point = candidate_point

                            if hit_point:
                                # Calculate ratio of distance traveled
                                # Project hit_point onto the ray to find fraction (0 to 1)
                                ratio = ray_geom.project_normalized(hit_point)
                                closest_hit_ratio = min(
                                    ratio, closest_hit_ratio)

                            # Buildings are sorted by distance, so we can break early
                            # if we found an intersection because it should be the closest
                            if closest_hit_ratio < 1.0:
                                break

            limit_degrees = max_dist_degrees * closest_hit_ratio

            # Limit degrees = 0 means we hit a building at the origin. We don't add any point in this case.
            # if limit_degrees > 0:
            # We compute max distance of fov for cases when camera is tilted
            # This happens if the building is further than the max_fov, or no building found but we have a max_fov
            if self.camera.max_fov_distance:
                # Approx conversion from meters to degrees
                # FIXME: This is an approximation that works for small distances. To improve
                max_fov_degrees = self.camera.max_fov_distance / 111320.0
                limit_degrees = min(limit_degrees, max_fov_degrees)

            # -- Distribute results to all scenarios based on limit --
            # Because configs are sorted max -> min, we can just take min(config_dist, closest_hit_dist)
            for conf in sorted_configs:
                effective_dist = min(conf['dist_degrees'], limit_degrees)

                # Project point that wwill be the end of the ray for this scenario/level
                p_x = origin.x + (effective_dist * cos_a * camera_lat_coef)
                p_y = origin.y + (effective_dist * sin_a)

                results[conf['scenario']][conf['level']].append((p_x, p_y))

        # Add origin to start of "fixed" cameras to make a cone
        if is_fixed:
            for s in results:
                for l in results[s]:
                    results[s][l].insert(0, (origin.x, origin.y))

        return results

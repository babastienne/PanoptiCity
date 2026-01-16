import math

from cameras.constants import FocusLevelChoices, FocusScenarioChoices
from cameras.services.utils import degree_direction_to_radian, get_lat_coef
from django.contrib.gis.geos import (LineString, MultiLineString, MultiPoint,
                                     MultiPolygon, Point)


class FOVCalculator():
    def __init__(self, camera):
        self.camera = camera

    def _find_closest_intersection_point(self, intersection, origin):
        """
        Given an intersection and an origin point, returns the closest intersection
        point to the origin on the intersection. Usefull to iterate over multi geometries.
        """
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
        return hit_point

    def _get_camera_range(self, is_fixed):
        """
        Given a camera, returns the range to  compute FOV
        """
        if is_fixed and self.camera.direction is not None:
            # -7 to 7 = 15 iterations ~= 85°
            rng = range(-7, 8)
        elif self.camera.camera_type in ["dome", "panning", "panorama"]:
            # 6.3 ~= 2pi = 360°
            rng = range(0, 63)
        else:
            # Should not happen because of previous check in the compute_focus method
            rng = []
        return rng

    def compute_fov_points(self, sorted_configs, buildings, buildings_camera_is_into_ids, max_fov_distance=None):
        """
        Core logic to compute each ray of the FOV of the camera and check for intersections
        with buildings. Returns a nested dictionary of points (representing polygons) for each scenario/level.
        """
        # Initialize results structure
        results = {s: {l: [] for l in FocusLevelChoices.values}
                   for s in FocusScenarioChoices.values}
        origin = self.camera.location
        ori_x = origin.x
        ori_y = origin.y

        # Determine angular range
        is_fixed = self.camera.camera_type == "fixed"

        camera_dir_rad = degree_direction_to_radian(
            self.camera.direction) if is_fixed else 0
        camera_lat_coef = get_lat_coef(origin)
        # The largest possible distance
        max_dist_degrees = sorted_configs[0]['dist_degrees']

        p_x = None  # Value x of the projected point on the ray
        p_y = None  # Value y of the projected point on the ray

        for x in self._get_camera_range(is_fixed):
            # -- Compute end of ray point and create LineString representing the ray --
            angle_rad = camera_dir_rad + (x / 10.0)

            cos_a = math.cos(angle_rad)
            sin_a = math.sin(angle_rad)

            # Convert meters vector to degrees vector
            vec_x_deg = max_dist_degrees * cos_a * camera_lat_coef
            vec_y_deg = max_dist_degrees * sin_a

            dest_x = ori_x + vec_x_deg
            dest_y = ori_y + vec_y_deg

            ray_geom = LineString(origin, Point(
                dest_x, dest_y, srid=4326), srid=4326)

            # -- Check intersection with buildings --
            # We track the hit ratio (0.0 to 1.0) to determine if we hit a building and at what distance
            closest_hit_ratio = 1.0  # 1.0 means no hit (full distance)
            add_origin_to_list = False

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
                            hit_point = self._find_closest_intersection_point(
                                intersection, origin)

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

            # Limit hit_ratio = 0 means we hit a building at the origin.
            if closest_hit_ratio == 0.0:
                if p_x == ori_x and p_y == ori_y:
                    # Last added point to the list was origin, no need to add it again
                    # We skip the rest of the processing for this ray
                    continue
                # Otherwise we add the origin point
                # There is two use cases for this:
                # - This is the first point we compute, we add it to the list of points
                # - Last added point was not origin, we add it
                add_origin_to_list = True

            if not add_origin_to_list:
                limit_degrees = max_dist_degrees * closest_hit_ratio

                # We compute max distance of fov for cases when camera is tilted
                # This happens if the building is further than the max_fov, or no building found but we have a max_fov
                if max_fov_distance:
                    # Approx conversion from meters to degrees
                    # FIXME: This is an approximation that works for small distances. To improve
                    max_fov_degrees = max_fov_distance / 111320.0
                    limit_degrees = min(limit_degrees, max_fov_degrees)

            # -- Distribute results to all scenarios based on limit --
            # Because configs are sorted max -> min, we can just take min(config_dist, closest_hit_dist)
            for conf in sorted_configs:
                if add_origin_to_list:
                    p_x = ori_x
                    p_y = ori_y
                else:
                    effective_dist = min(conf['dist_degrees'], limit_degrees)

                    # Project point that will be the end of the ray for this scenario/level
                    p_x = ori_x + (effective_dist * cos_a * camera_lat_coef)
                    p_y = ori_y + (effective_dist * sin_a)

                results[conf['scenario']][conf['level']].append((p_x, p_y))

        # Add origin to start of "fixed" cameras to make a cone
        if is_fixed:
            for s in results:
                for l in results[s]:
                    results[s][l].insert(0, (ori_x, ori_y))

        return results

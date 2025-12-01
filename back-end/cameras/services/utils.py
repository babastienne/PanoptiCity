import math

import mercantile
from django.contrib.gis.geos import Polygon


def create_polygon(points_list):
    """
    Given a list of points [(x1, y1), (x2, y2), ...], create a Polygon object with srid=4326.
    If the first and last points are not the same, close the polygon by adding the first point at the end.
    """
    if points_list[0] != points_list[-1]:
        points_list.append(points_list[0])
    polygon = Polygon(points_list, srid=4326)
    return polygon


def get_lat_coef(point):
    """
    Compute and return the latitude coefficient of a point to use to adapt calculations for longitude axis
    Formula is : 1 / cos(latitude in radian)
    Used because in degrees the X-axis (Longitude) shrinks as we move away from equator
    """
    # Conversion in radian = x * math.pi / 180
    # Could use math.radians instead
    return 1.0 / math.cos(point.y * math.pi / 180)


def get_neighboring_tiles(tile):
    """
    Given a tile (quadkey string), return a list of neighboring tiles including itself.
    """
    mercan_tile = mercantile.quadkey_to_tile(tile)
    list_tiles = [mercantile.quadkey(neighbor)
                  for neighbor in mercantile.neighbors(mercan_tile)]
    list_tiles.append(tile)
    return list_tiles


def degree_direction_to_radian(direction_degrees):
    """
    Given a direction in degrees (0 = North, 90 = East, etc.),
    compute and return the direction in radians
    """
    clean_direction = 90 - direction_degrees
    if clean_direction > 180:
        clean_direction -= 360
    elif clean_direction < -180:
        clean_direction += 360
    radian_direction = (clean_direction * math.pi) / 180
    return radian_direction

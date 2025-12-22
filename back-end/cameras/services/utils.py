import logging
import math

import mercantile
from django.contrib.gis.geos import Polygon
from django.db.models import Q


def setup_logger(log_file, verbose):
    """Configures a file logger."""
    logger = logging.getLogger("camera_import")
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)

    # Create file handler
    fh = logging.FileHandler(log_file, mode='a')
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)

    # Clear existing handlers to avoid duplicates if run multiple times in shell
    if logger.hasHandlers():
        logger.handlers.clear()

    logger.addHandler(fh)
    return logger


def extract_node_data(elem):
    """
    Extracts data from osmium node into a plain python dict.
    Usefull when multi-processing as we cannot pass object to workers because it's C++.
    """
    return {
        'id': elem.id,
        'lon': elem.location.lon,
        'lat': elem.location.lat,
        'tags': dict(elem.tags),  # Convert osmium TagList to python dict
    }


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


def get_neighboring_tiles(tile_quadkey, tile_model):
    """
    Given a tile (quadkey string), return a list of neighboring tiles including itself.
    This take into account the fact that we work with an adaptive grid.
    s
    :param tile_quadkey: The quadkey string to find neighbors for.
    :param tile_model: The Tile model to use for querying.
    """
    tile = mercantile.quadkey_to_tile(tile_quadkey)

    # Get the 8 standard neighbors at the SAME level + the tile itself
    theoretical_neighbors = [mercantile.quadkey(n)
                             for n in mercantile.neighbors(tile)]
    theoretical_neighbors.append(tile_quadkey)

    # Build a set of all possible ancestors for these 9 tiles
    # If a neighbor is '120222', ancestors are {'1', '12', '120', '1202', '12022'}
    ancestors_and_exact = set()
    for qk in theoretical_neighbors:
        for i in range(1, len(qk) + 1):
            ancestors_and_exact.add(qk[:i])

    # Construct the query
    # We look for tiles whose id is in our ancestor list
    # OR tiles that start with any of our 9 theoretical neighbors (= childrens)
    query = Q(id__in=ancestors_and_exact)

    # Children checks (id starts with theoretical_neighbor)
    for qk in theoretical_neighbors:
        query |= Q(id__startswith=qk)

    return tile_model.objects.filter(query).distinct().values_list('id', flat=True)


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

import logging
import math
import os

import mercantile
import requests
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


def get_containing_tiles(lat, lon, min_zoom=4, max_zoom=21):
    """
    Returns a list of (z, x, y) tuples representing all tiles containing a point.
    """
    return [(*mercantile.tile(lon, lat, z),) for z in range(min_zoom, max_zoom + 1)]


def get_tiles_for_polygon(polygon, min_zoom=14, max_zoom=16):
    """
    Returns a set of (x, y, z) tuples for all tiles covering a polygon's extent.
    """
    # .extent returns (xmin, ymin, xmax, ymax) -> (west, south, east, north)
    west, south, east, north = polygon.extent

    affected_tiles = set()

    for z in range(min_zoom, max_zoom + 1):
        # mercantile.tiles returns a generator of Tile(x, y, z) objects
        tiles = mercantile.tiles(west, south, east, north, z)
        for t in tiles:
            affected_tiles.add((t.x, t.y, t.z))

    return affected_tiles


def purge_camera_tiles(camera):
    """
    Given a camera, compute associated tiles and invalidate the
    nginx cache for those tiles
    """
    lat, lon = camera.location.y, camera.location.x

    affected = get_containing_tiles(lat, lon)

    base_url = "http://nginx/api/cameras"
    headers = {
        "Host": os.getenv('BACKEND_DOMAIN_NAME', 'localhost'),
        "X-Purge-Token": os.getenv('NGINX_CACHE_SECRET_KEY', '')
    }

    for x, y, z in affected:
        tile_url = f"{base_url}.json?tile={z}/{x}/{y}"
        try:
            requests.get(tile_url, headers=headers, timeout=0.5)
        except requests.RequestException:
            pass
    cam_url = f"{base_url}/{camera.id}.json"
    try:
        requests.get(cam_url, headers=headers, timeout=0.5)
    except requests.RequestException as e:
        # Log the error instead of just printing
        print(f"Purge failed for {tile_url}: {e}")


def purge_focus_tiles(tiles_with_scenario):
    """
    tiles_with_scenario: a set of tuples (x, y, z, scenario)
    """
    base_url = "http://nginx/api/focus"
    headers = {
        "Host": os.getenv('BACKEND_DOMAIN_NAME', 'localhost'),
        "X-Purge-Token": os.getenv('NGINX_CACHE_SECRET_KEY', '')
    }

    for x, y, z, scenario in tiles_with_scenario:
        tile_url = f"{base_url}/{z}/{x}/{y}/{scenario}/"
        try:
            # Using a short timeout is good practice
            requests.get(tile_url, headers=headers, timeout=1)
        except requests.RequestException as e:
            # Log the error instead of just printing
            print(f"Purge failed for {tile_url}: {e}")


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

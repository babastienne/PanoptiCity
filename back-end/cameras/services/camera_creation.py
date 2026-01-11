import logging
import os
import re

from cameras.models import Camera, CameraFocus, CameraTags, Tile
from cameras.services.utils import (get_tiles_for_polygon, purge_camera_tiles,
                                    purge_focus_tiles)
from django.contrib.gis.geos import Point
from django.db import connections


def get_worker_logger(log_file_path, verbose):
    """
    Configures a logger for the current worker process.
    """
    # Use the Process ID (PID) to ensure unique identification in debug
    logger_name = f"camera_worker_{os.getpid()}"
    logger = logging.getLogger(logger_name)

    # Only configure if it hasn't been configured yet (ProcessPool reuses workers)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG if verbose else logging.INFO)

        fh = logging.FileHandler(log_file_path, mode='a')
        formatter = logging.Formatter(
            '%(asctime)s - [Worker %(process)d] - %(levelname)s - %(message)s')
        fh.setFormatter(formatter)
        logger.addHandler(fh)

        # Prevent propagation to root logger to avoid console spam if Django configures root
        logger.propagate = False

    return logger


def process_camera_batch(camera_data_list, update=False, verbose=False, log_file=None):
    """
    Worker function executed in a separate process.
    Receives a list of dictionaries containing raw OSM data.
    """
    # Init logger for worker
    logger = get_worker_logger(log_file, verbose)

    # Close any existing connections to force a fresh connection
    for conn in connections.all():
        conn.close()

    skipped = 0

    cameras_to_create = []
    tags_to_create = []
    focus_to_create = []

    batch_ids = [d['id'] for d in camera_data_list]

    skip_ids = set()
    existing_ids = set(Camera.objects.filter(
        id__in=batch_ids).values_list('id', flat=True))

    if not update:
        skip_ids = existing_ids

    for data in camera_data_list:
        if data['id'] in skip_ids:
            skipped += 1
            logger.debug("Camera #%s already exists. Skipped.", data['id'])
            continue

        try:
            camera, new_or_updated_tags, new_or_updated_focus = create_camera(
                data, logger
            )
            cameras_to_create.append(camera)
            tags_to_create.extend(new_or_updated_tags)
            focus_to_create.extend(new_or_updated_focus)

        except Exception as e:
            logger.error("Error processing camera %s: %s", data['id'], e)
            continue

    tiles_to_purge = set()
    if update:
        logger.debug(
            "Storing existing focus location to update cache")
        observation_focuses_to_delete = CameraFocus.objects.filter(
            camera_id__in=existing_ids,
            level="observation"
        )
        # We need to track which scenario each tile belongs to
        # Using a set of tuples: (x, y, z, scenario)
        for focus in observation_focuses_to_delete:
            tiles = get_tiles_for_polygon(focus.geom)
            for x, y, z in tiles:
                tiles_to_purge.add((x, y, z, focus.scenario))

        CameraFocus.objects.filter(camera_id__in=existing_ids).delete()
        CameraTags.objects.filter(camera_id__in=existing_ids).delete()
        Camera.objects.filter(id__in=existing_ids).delete()

    # We save inside the worker to reduce memory overhead in the main process
    if cameras_to_create:
        Camera.objects.bulk_create(
            cameras_to_create,
            update_conflicts=True,
            update_fields=['location', 'mount', 'surveillance_type', 'focus',
                           'surveillance', 'camera_type', 'zone', 'height', 'direction', 'angle', 'tile'],
            unique_fields=['id']
        )
    if tags_to_create:
        CameraTags.objects.bulk_create(
            tags_to_create,
            update_conflicts=True,
            update_fields=['value'],
            unique_fields=['camera_id', 'name']
        )
    if update:
        for cam in Camera.objects.filter(id__in=existing_ids):
            purge_camera_tiles(cam)
    if focus_to_create:
        CameraFocus.objects.bulk_create(
            focus_to_create,
            update_conflicts=True,
            update_fields=['geom', 'with_intersection'],
            unique_fields=['camera_id', 'scenario', 'level']
        )
        if update:
            observation_focuses_to_update = CameraFocus.objects.filter(
                camera_id__in=existing_ids,
                level="observation"
            )
            for focus in observation_focuses_to_update:
                tiles = get_tiles_for_polygon(focus.geom)
                for x, y, z in tiles:
                    tiles_to_purge.add((x, y, z, focus.scenario))
    if tiles_to_purge:
        logger.debug(
            "Purging nginx cache for focuses")
        purge_focus_tiles(tiles_to_purge)

    # Cleanup
    for conn in connections.all():
        conn.close()

    return len(cameras_to_create), skipped


COMPASS_POINTS = {
    # English
    "n": 0, "north": 0, "nne": 22, "ne": 45, "ene": 67,
    "e": 90, "east": 90, "ese": 112, "se": 135, "sse": 157,
    "s": 180, "south": 180, "ssw": 202, "sw": 225, "wsw": 247,
    "w": 270, "west": 270, "wnw": 292, "nw": 315, "nnw": 337,
    # French / Spanish / Common Shorthand
    "o": 270, "ouest": 270, "est": 90,
    "no": 315, "so": 225, "no": 315, "se": 135,
    # Typos and specific variants found in logs
    "nee": 22, "nww": 337, "ees": 112, "wws": 247, "see": 157, "sww": 202,
    # Traffic directions
    "nb": 0, "sb": 180, "eb": 90, "wb": 270,
    "north-north-east": 22, "south-south-west": 202, "north east": 45,
}

# Values that mean "we don't know" or "too complex for a single int"
SKIP_WORDS = {
    "clockwise", "variable", "all", "omni", "yes", "null", "fixme", "forward", "boh",
    "left", "right", "intersection", "street", "entrance", "overheid", "backward",
    "flock raven", "lamp post", "both", "both3", "xx", "fixed", "wide", "down", "tree", "?"
}

def parse_single_numeric(s):
    """Clean a string and try to extract a single numeric degree or compass point."""
    s = s.strip().lower().rstrip('°').rstrip('o').rstrip('\\').replace('rees', '').strip()
    if not s or s in SKIP_WORDS:
        return None
    if s in COMPASS_POINTS:
        return COMPASS_POINTS[s]
    return float(s.replace(',', '.'))


def compute_direction(tags, camera_id, logger=None):
    raw = tags.get("camera:direction") or tags.get("surveillance:direction") or tags.get("direction")
    if raw is None: return None

    try:
        # Handle already numeric
        if isinstance(raw, (int, float)):
            return int(raw) % 360

        # Basic cleaning
        s = str(raw).lower().strip()

        # Check for broad coverage ranges (return None as per your requirement)
        if s in ["0-360", "0-359", "0;90;180;270", "90;180;270;360"]:
            return None

        # Handle List Separators (FIXME: take first value only for now)
        # Handles: ";", "&", ",", "|", " "
        s = re.split(r'[;,&|\s]+', s)[0]

        # Handle Ranges (e.g., "90-180" or "45-90-180")
        if "-" in s:
            range_parts = s.split("-")
            vals = [parse_single_numeric(p) for p in range_parts if parse_single_numeric(p) is not None]
            if len(vals) >= 2:
                start, end = vals[0], vals[-1]
                if end < start: midpoint = (start + end + 360) / 2
                else: midpoint = (start + end) / 2
                return int(midpoint % 360)

        # Single value parse
        val = parse_single_numeric(s)
        val = int(round(val)) % 360 if val is not None else None
    except Exception:
        logger.info(f"Camera #{camera_id}. Field : Direction. Expected int, found {raw}. Field kept empty.")
        val = None
    return val


def compute_angle(tags, camera_id, logger=None):
    raw = tags.get("camera:angle")
    if raw is None: return None
    try:
        if isinstance(raw, (int, float)): return int(raw) % 361

        s = str(raw).lower().strip()
        if "%" in s or s in SKIP_WORDS: return None # Discard tilt like -5% or "down"

        # Take first in list
        s = re.split(r'[;,&]+', s)[0]

        # Handle range
        if "-" in s:
            parts = s.split("-")
            vals = [parse_single_numeric(p) for p in parts if parse_single_numeric(p) is not None]
            if len(vals) >= 2:
                return int(round(sum(vals) / len(vals))) % 361

        val = parse_single_numeric(s)
        val = int(round(val)) % 361 if val is not None else None
    except Exception:
        logger.info(f"Camera #{camera_id}. Field : Angle. Expected int, found {raw}. Field kept empty.")
        val = None
    return val


def compute_height(tags, camera_id, logger=None):
    raw = tags.get("height") or tags.get("ele")
    if raw is None: return None
    try:
        if isinstance(raw, (int, float)): return float(raw)

        s = str(raw).lower().strip()

        # Handle descriptive terms found in logs
        if any(word in s for word in ["etage", "porte", "ground", "roof"]):
            return None

        # Handle Ranges (6-9) or (3-4m)
        if "-" in s or " to " in s:
            parts = re.split(r'-| to ', s)
            vals = []
            for p in parts:
                res = compute_height({"height": p}, camera_id)
                if res: vals.append(res)
            return sum(vals) / len(vals) if vals else None

        # Handle metric shorthand (2m50)
        metric_match = re.match(r'^(\d+)\s*m\s*(\d+)$', s)
        if metric_match:
            return float(metric_match.group(1)) + (float(metric_match.group(2)) / 100)

        # Handle imperial units (3ft, ~20ft, 102'0")
        if "ft" in s or "'" in s:
            # Extract all numbers and convert first found
            nums = re.findall(r"[-+]?\d*\.\d+|\d+", s)
            if nums:
                return round(float(nums[0]) * 0.3048, 2)
            return None

        # Standard clean and float
        s = s.rstrip('m').rstrip('meter').rstrip('meters').replace(',', '.').replace('..', '.').strip()
        # Remove any leading "~" or non-numeric fluff
        s = re.sub(r'[^\d.]', '', s)
        return float(s)
    except Exception:
        logger.info(f"Camera #{camera_id}. Field : Height. Expected int, found {raw}. Field kept empty.")
        return None


def create_camera(camera_osm, logger=None, nearby_buildings_qs=None):
    location = Point([camera_osm['lon'], camera_osm['lat']], srid=4326)
    camera = Camera(id=camera_osm['id'], location=location)
    tags = camera_osm.get('tags', {})

    camera.mount = tags.get("camera:mount", "")
    camera.surveillance_type = tags.get("surveillance:type", "camera")
    camera.surveillance = tags.get("surveillance", "")
    camera.camera_type = tags.get("camera:type", "")
    camera.zone = tags.get("surveillance:zone", "")

    camera.height = compute_height(tags, camera.id, logger)
    camera.direction = compute_direction(tags, camera.id, logger)
    camera.angle = compute_angle(tags, camera.id, logger)

    try:
        camera.tile = Tile.objects.get(geom__contains=camera.location).id
    except Tile.DoesNotExist:
        camera.tile = Tile.objects.filter(
            geom__intersects=camera.location).first().id

    new_or_updated_focus = camera.generate_focus(nearby_buildings_qs)

    new_or_updated_tags = [
        CameraTags(camera_id=camera, name=tag_name, value=str(tags[tag_name]))
        for tag_name in tags
    ]
    logger.debug(f"Camera #{camera.id} processed.")

    return camera, new_or_updated_tags, new_or_updated_focus

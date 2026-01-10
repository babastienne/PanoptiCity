import logging
import os

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


def compute_direction(tags, camera, logger=None):
    direction = None
    if "camera:direction" in tags:
        direction = tags["camera:direction"]
    elif "surveillance:direction" in tags:
        direction = tags["surveillance:direction"]
    elif "direction" in tags:
        direction = tags["direction"]

    if isinstance(direction, str):
        direction = direction.lower().rstrip('°').lstrip(
            '-').replace('deg', '').replace('degrees', '').strip()
        # If the direction contains ";" it means its a list of directions and there is multiple cameras
        if direction in ["0-360", "0-359", "0;90;180;270", "90;180;270;360"]:
            return None  # See all direction
        if ";" in direction:
            # FIXME: We take the first direction but we should store the fact that there is multiple
            # cameras to alert the user on the map and suggest a way to split them
            direction = direction.split(";")[0]
        if "&" in direction:
            direction = direction.split("&")[0]

        COMPASS_POINTS = {
            "n": 0, "north": 0,
            "nne": 22,
            "ne": 45,
            "ene": 67,
            "e": 90, "east": 90,
            "ese": 112,
            "se": 135,
            "sse": 157,
            "s": 180, "south": 180,
            "ssw": 202,
            "sw": 225,
            "wsw": 247,
            "w": 270, "west": 270,
            "wnw": 292,
            "nw": 315,
            "nnw": 337
        }

        def parse_single_value(s):
            """Converts a single string (N, 45, etc) to an integer degree."""
            s = s.strip()
            if s in COMPASS_POINTS:
                return COMPASS_POINTS[s]
            try:
                # Handle float values sometimes entered (e.g. 45.5)
                return int(round(float(s)))
            except Exception:
                logger.info(
                    f"Camera #{camera.id}. Field : Direction. Expected int, found {direction}. Field kept empty.")
                return None

        if "-" in direction:
            parts = direction.split("-")
            if len(parts) == 2:
                start = parse_single_value(parts[0])
                end = parse_single_value(parts[1])

                if start is not None and end is not None:
                    # Calculate the midpoint of the arc (sense of rotation is clockwise)
                    if end < start:
                        # Case wrapping around North (e.g., 315 to 45)
                        midpoint = (start + end + 360) / 2
                    else:
                        # Standard case (e.g., 90 to 270)
                        midpoint = (start + end) / 2

                    direction = int(midpoint % 360)

        direction = parse_single_value(direction)
    return direction


def compute_height(tags, camera, logger):
    height = None
    attribute = ""
    try:
        if "height" in tags:
            height = tags["height"]
            attribute = "height"
        elif "ele" in tags:
            height = tags["ele"]
            attribute = "ele"
        if height:
            if ";" in height:
                # FIXME: We take the first height but we should store the fact that there is multiple
                # cameras to alert the user on the map and suggest a way to split them
                height = height.split(";")[0]
            if "&" in height:
                height = height.split("&")[0]
            # If the height has a trailing "m" or "M" or "meter" or "Meter", we remove it
            height = height.lower().strip().rstrip("m").rstrip('meter').rstrip('meters')
            # If height contains ',', we replace it by '.'
            height = height.replace(",", ".")
            height = float(height)
    except Exception as e:
        logger.info(
            f"Camera #{camera.id}. Field : {attribute}. Expected float, found {tags['height']}. Field kept empty.")
        raise e
    return height


def create_camera(camera_osm, logger=None, nearby_buildings_qs=None):
    location = Point([camera_osm['lon'], camera_osm['lat']], srid=4326)
    camera = Camera(id=camera_osm['id'], location=location)
    tags = camera_osm['tags']
    if "description" in tags:
        camera.description = tags["description"]
    if "camera:mount" in tags:
        camera.mount = tags["camera:mount"]
    if "surveillance:type" in tags:
        camera.surveillance_type = tags["surveillance:type"]
    if "surveillance" in tags:
        camera.surveillance = tags["surveillance"]
    if "camera:type" in tags:
        camera.camera_type = tags["camera:type"]
    if "surveillance:zone" in tags:
        camera.zone = tags["surveillance:zone"]

    camera.height = compute_height(tags, camera, logger)

    camera.direction = compute_direction(tags, camera, logger)

    if "camera:angle" in tags:
        try:
            camera.angle = int(tags["camera:angle"])
        except Exception:
            logger.info(
                f"Camera #{camera.id}. Field : Angle. Expected integer, found {tags['camera:angle']}. Field kept empty.")

    try:
        camera.tile = Tile.objects.get(geom__contains=camera.location).id
    except Tile.DoesNotExist:
        camera.tile = Tile.objects.filter(
            geom__intersects=camera.location).first().id

    new_or_updated_focus = camera.generate_focus(nearby_buildings_qs)

    new_or_updated_tags = [CameraTags(
        camera_id=camera,
        name=tag_name,
        value=tags[tag_name]
    ) for tag_name in tags]

    logger.debug(f"Camera #{camera.id} processed.")

    return camera, new_or_updated_tags, new_or_updated_focus

import logging
import os

from cameras.models import Camera, CameraFocus, CameraTags, Tile
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

    if update:
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
    if focus_to_create:
        CameraFocus.objects.bulk_create(
            focus_to_create,
            update_conflicts=True,
            update_fields=['geom', 'with_intersection'],
            unique_fields=['camera_id', 'scenario', 'level']
        )

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
        direction = direction.lower()
        if direction in ["n", "north"]:
            direction = 0
        elif direction in ["ne"]:
            direction = 45
        elif direction in ["e", "east"]:
            direction = 90
        elif direction in ["se"]:
            direction = 135
        elif direction in ["s", "south"]:
            direction = 180
        elif direction in ["sw"]:
            direction = 225
        elif direction in ["w", "west"]:
            direction = 270
        elif direction in ["nw"]:
            direction = 315
        # If the string got a trailing '°', we remove it
        elif direction.endswith("°"):
            direction = direction[:-1]
        # If the direction contains ";" it means its a list of directions and there is multiple cameras
        elif ";" in direction:
            # FIXME: We take the first direction but we should store the fact that there is multiple
            # cameras to alert the user on the map and suggest a way to split them
            direction = direction.split(";")[0]

    try:
        if direction:
            direction = int(direction)
            if direction < -1000 or direction > 1000:
                raise ValueError("Direction out of range")
        else:
            direction = None
    except Exception:
        logger.info(
            f"Camera #{camera.id}. Field : Direction. Expected int, found {direction}. Field kept empty.")
        direction = None

    return direction


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

    try:
        if "height" in tags:
            height = tags["height"]
        elif "ele" in tags:
            height = tags["ele"]
        if height:
            # If the height has a trailing "m" or "M" or "meter" or "Meter", we remove it
            if height.lower().endswith("m"):
                height = height[:-1]
            elif height.lower().endswith("meter"):
                height = height[:-5]
            # If height contains ',', we replace it by '.'
            height = height.replace(",", ".")
            camera.height = float(height)
    except Exception:
        if "height" in tags:
            logger.info(
                f"Camera #{camera.id}. Field : height. Expected float, found {tags['height']}. Field kept empty.")
        elif "ele" in tags:
            logger.info(
                f"Camera #{camera.id}. Field : ele. Expected float, found {tags['ele']}. Field kept empty.")

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

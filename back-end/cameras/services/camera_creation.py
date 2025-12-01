from cameras.models import Camera, CameraFocus, CameraTags, Tile
from django.contrib.gis.geos import Point
from django.db import connections


def process_camera_batch(camera_data_list, update=False, verbose=False):
    """
    Worker function executed in a separate process.
    Receives a list of dictionaries containing raw OSM data.
    """
    # Close any existing connections to force a fresh connection
    for conn in connections.all():
        conn.close()

    skipped = 0

    cameras_to_create = []
    tags_to_create = []
    focus_to_create = []

    batch_ids = [d['id'] for d in camera_data_list]

    existing_ids = set()
    if not update:
        existing_ids = set(Camera.objects.filter(
            id__in=batch_ids).values_list('id', flat=True))

    for data in camera_data_list:
        if data['id'] in existing_ids:
            if verbose:
                print(f"DEBUG: Camera #{data['id']} already exists. Skipped.")
                skipped += 1
            continue

        try:
            camera, new_or_updated_tags, new_or_updated_focus = create_camera(
                data, verbose
            )
            cameras_to_create.append(camera)
            tags_to_create.extend(new_or_updated_tags)
            focus_to_create.extend(new_or_updated_focus)

        except Exception as e:
            print(f"Error processing camera {data['id']}: {e}")
            continue

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
            update_fields=['geom'],
            unique_fields=['camera_id', 'scenario', 'level']
        )

    # Cleanup
    for conn in connections.all():
        conn.close()

    return len(cameras_to_create), skipped


def compute_direction(tags, camera):
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
        direction = int(direction) if direction else None
    except Exception:
        # Print warning and set direction to None
        print(
            f"INFO: Camera #{camera.id}. Field : Direction. Expected int, found {direction}. Field kept empty.")
        direction = None

    return direction


def create_camera(camera_osm, verbose=False):
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
            print(
                f"INFO: Camera #{camera.id}. Field : height. Expected float, found {tags['height']}. Field kept empty.")
        elif "ele" in tags:
            print(
                f"INFO: Camera #{camera.id}. Field : ele. Expected float, found {tags['ele']}. Field kept empty.")

    camera.direction = compute_direction(tags, camera)

    if "camera:angle" in tags:
        try:
            camera.angle = int(tags["camera:angle"])
        except Exception:
            print(
                f"INFO: Camera #{camera.id}. Field : Angle. Expected integer, found {tags['camera:angle']}. Field kept empty.")

    # FIXME: Not working when no building around (cause no tile created)
    camera.tile = Tile.objects.get(geom__contains=camera.location).id

    new_or_updated_focus = camera.generate_focus()

    new_or_updated_tags = [CameraTags(
        camera_id=camera,
        name=tag_name,
        value=tags[tag_name]
    ) for tag_name in tags]

    if verbose:
        print(f"DEBUG: Camera #{camera.id} processed.")

    return camera, new_or_updated_tags, new_or_updated_focus

import osmium

from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point

from cameras.models import Camera, CameraTags, Tile

from timeit import default_timer as timer
from datetime import timedelta


class Command(BaseCommand):
    help = "Load all cameras from osm file"

    def add_arguments(self, parser):
        parser.add_argument(
            "camera_file", help="Mandatory parameter: path to file to import"
        )
        parser.add_argument(
            "--update",
            "-u",
            action="store_true",
            default=False,
            dest="update_field",
            help="Force update of cameras (can take some time)",
        )
        parser.add_argument(
            "--details",
            "-d",
            action="store_true",
            dest="verbose_field",
            help="If parameter is set, show more logs",
        )

    def handle(self, *args, **options):
        start = timer()

        filename = options["camera_file"]
        update = options.get("update_field")
        self.verbose = options.get("verbose_field")

        imported = 0
        skipped = 0

        try:
            for elem in osmium.FileProcessor(filename, osmium.osm.NODE).with_filter(
                osmium.filter.TagFilter(("man_made", "surveillance"))
            ):
                if update or not Camera.objects.filter(id=elem.id).exists():
                    self.create_camera(elem)
                    imported += 1
                else:
                    if self.verbose:
                        self.stdout.write(
                            f"Camera #{elem.id} already exists. Skipped.")
                    skipped += 1
        except Exception:
            raise

        self.stdout.write(
            f"--- Summary ---\n{imported} new cameras imported or updated\n{skipped} cameras skipped (already existing)"
        )
        end = timer()
        self.stdout.write(f"Time to execute {timedelta(seconds=end-start)}")

    def compute_direction(self, tags, camera):
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
            self.stderr.write(
                f"Camera #{camera.id}. Field : Direction. Expected int, found {direction}. Field kept empty."
            )
            direction = None

        return direction

    def create_camera(self, camera_osm):
        location = Point([camera_osm.lon, camera_osm.lat], srid=4326)
        try:
            camera = Camera.objects.get(id=camera_osm.id)
            camera.location = location
            created = False
        except Camera.DoesNotExist:
            camera, created = Camera.objects.get_or_create(
                id=camera_osm.id, location=location
            )
        tags = camera_osm.tags
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
                # If the height has a trailing "m" or "M" or "meter" or "Meter", we remove it
                if height.lower().endswith("m"):
                    height = height[:-1]
                elif height.lower().endswith("meter"):
                    height = height[:-5]
                # If height contains ',', we replace it by '.'
                height = height.replace(",", ".")
                camera.height = float(height)
            elif "ele" in tags:
                camera.height = float(tags["ele"])
        except Exception:
            if "height" in tags:
                self.stderr.write(
                    f"Camera #{camera.id}. Field : height. Expected float, found {tags['height']}. Field kept empty."
                )
            elif "ele" in tags:
                self.stderr.write(
                    f"Camera #{camera.id}. Field : ele. Expected float, found {tags['ele']}. Field kept empty."
                )

        camera.direction = self.compute_direction(tags, camera)

        if "camera:angle" in tags:
            try:
                camera.angle = int(tags["camera:angle"])
            except Exception:
                self.stderr.write(
                    f"Camera #{camera.id}. Field : Angle. Expected integer, found {tags['camera:angle']}. Field kept empty."
                )

        # FIXME: Not working when no building around (cause no tile created)
        camera.tile = Tile.objects.get(geom__contains=camera.location).id

        camera.generate_computed_fields()
        camera.save()

        for tag in tags:
            CameraTags.objects.update_or_create(
                camera_id=camera,
                name=tag.k,
                value=tag.v
            )

        if self.verbose:
            if created:
                self.stdout.write(f"Camera #{camera.id} created.")
            else:
                self.stdout.write(f"Camera #{camera.id} updated.")

        return camera

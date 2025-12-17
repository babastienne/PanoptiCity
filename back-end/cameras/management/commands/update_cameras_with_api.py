from datetime import timedelta
from timeit import default_timer as timer

import osmium
import requests
from cameras.models import Building, Camera, CameraFocus, CameraTags
from cameras.services.camera_creation import create_camera
from cameras.services.overpass import get_buildings_in_polygon
from cameras.services.utils import extract_node_data, setup_logger
from django.contrib.gis.geos import GEOSGeometry, Polygon
from django.core.management.base import BaseCommand
from tqdm import tqdm


class Command(BaseCommand):
    help = """
    Update cameras from osm file, querying overpass API to get surrounding buildings.
    This command is to be used after initial import, to update the camera table
    if you want to get rid of buildings in your database.
    """

    def add_arguments(self, parser):
        parser.add_argument(
            "camera_file",
            help="Mandatory parameter: path to file to import (osm.pbf or .osm format) [eg: /osm-data/sample-data.osm.pbf]",
        )
        parser.add_argument(
            "--details",
            "-d",
            action="store_true",
            dest="verbose_field",
            help="If parameter is set, include detailed logs in the log file",
        )
        parser.add_argument(
            "--log-file",
            "-l",
            type=str,
            default="import_cameras.log",
            dest="log_file",
            help="Path to the output log file (default: load_cameras.log)",
        )
        parser.add_argument(
            "--ignore-prompt",
            "-y",
            action="store_true",
            dest="ignore_prompt",
            help="If set, no prompt will be displayed to user. Warning: this wil automatically drop your Buildings database !",
        )

    def ask_user_confirmation(self, ignore_prompt):
        """
        If ignore_prompt is False, ask the user if he is ok to drop database

        :param ignore_prompt: attribute of the command. If True the user will be prompted a question
        :return: 1 if the program should stop, 0 if the program should continue
        """
        if not ignore_prompt:
            self.stdout.write(
                self.style.WARNING(
                    "This operation will DROP the entire Buildings database and re-fetch buildings from Overpass API for each camera.\n" +
                    "You should use this command only when in a running phase after all cameras as already been imported first !"
                )
            )
            confirm = input(
                "Are you sure you want to proceed? Type 'YES' to continue: "
            )
            if confirm != "YES":
                self.stdout.write(self.style.ERROR("Operation cancelled by user."))
                return 1
        return 0

    def get_cameras_from_file(self, logger, filename):
        """
        Read OSM file and extract nodes that are cameras.

        :param logger: the logger to use to print info into
        :param filename: path to the file to parse with osmium
        :return: an array of dict representing cameras (id, tags, lon, lat)
        """
        cameras_to_import = []
        with tqdm(desc="Reading OSM file", unit=" cameras found") as pbar_read:
            logger.debug("Starting to read OSM diff file...")
            # Phase 1: Reading OSM file and getting cameras to update
            for elem in osmium.FileProcessor(filename, osmium.osm.NODE).with_filter(
                osmium.filter.TagFilter(("man_made", "surveillance"))
            ):
                data = extract_node_data(elem)
                cameras_to_import.append(data)
                pbar_read.update(1)
        return cameras_to_import

    def camera_creation_using_overpass(self, camera, logger):
        """
        Fucntion to handle the creation of a camera. It is done in multiple steps:
        - Simulation of creation to get the maximum focus of the camera
        - Fetching from overpass the buildings intersecting the max focus
        - Creation inthe DB of the returned buildings from overpass
        - Computation of the real objects (camera, tags, focus)
        - Saving everything in DB and dropping buildings

        This is far from optimal but given the low number of cameras to update it is
        good enough.

        :param camera: dict representing the camera to process (id, tags, lon, lat)
        :param logger: the logger used to print debugs logs
        :return: boolean, True if the creation is a success, False if an error occured
        """
        success = True
        try:
            # Step 0: Destroying possible existing camera, tags and focus
            logger.debug("Destroying existing camera, focus and tags if they exists")
            CameraFocus.objects.filter(camera_id=camera['id']).delete()
            CameraTags.objects.filter(camera_id=camera['id']).delete()
            Camera.objects.filter(id=camera['id']).delete()

            # Step 1: Simulate camera creation without buildings to get the max focus possible
            logger.debug("Simulate camera creation to get maximum focus")
            camera_to_create, computed_tags, computed_focus = create_camera(camera, logger, [])
            if computed_focus:
                logger.debug("Got focus, converting it to polygon")
                largest_focus = computed_focus[-1].geom  # We do not take the largest focus as we want the request not to be too heavy
                # As the computed focus are converted to MultiPolygon to fit with DB, we transform it to a Polgon
                largest_focus = largest_focus.buffer(0)

                # Step 2: We fetch from overpass the buildings intersecting the focus
                logger.debug("Fetching buildings intersecting the polygon")
                intersecting_building = get_buildings_in_polygon(largest_focus, logger)
                logger.debug("Got a response from Overpass")

                # Step 3: We create the fetched buildings in the database and then create for good the camera and tags / focus
                logger.debug("Creating the buildings in database")
                Building.objects.bulk_create(intersecting_building)
                nearby_buildings_qs = Building.objects.all().only('id', 'geom')
                logger.debug("Computation of the new camera with surrounding buildings")
                camera_to_create, computed_tags, computed_focus = create_camera(camera, logger, nearby_buildings_qs)
            else:
                logger.debug("Focus was empty, camera cannot compute focus. Skipping...")
            logger.debug(f"Saving the camera {camera['id']} in database")
            camera_to_create.save()
            if computed_tags:
                logger.debug("Saving the computed tags in database")
                CameraTags.objects.bulk_create(
                    computed_tags,
                    update_conflicts=True,
                    update_fields=['value'],
                    unique_fields=['camera_id', 'name']
                )
            if computed_focus:
                logger.debug("Saving the computed focus in database")
                CameraFocus.objects.bulk_create(
                    computed_focus,
                    update_conflicts=True,
                    update_fields=['geom'],
                    unique_fields=['camera_id', 'scenario', 'level']
                )

            # Step 4: We flush the building database again
            Building.objects.all().delete()

        except Exception as e:
            error_message = f"CRITICAL: Error while trying to handle camera creation.\nSkipping a camera...\nError: {e}"
            self.stderr.write(error_message)
            logger.error(error_message)
            success = False
        return success

    def handle(self, *args, **options):
        start = timer()

        filename = options["camera_file"]
        verbose = options.get("verbose_field")
        log_file = options.get("log_file")
        ignore_prompt = options.get("ignore_prompt")

        # Setup logging
        logger = setup_logger(log_file, verbose)
        self.stdout.write(f"Logs will be written to: {log_file}")

        total_imported = 0
        total_skipped = 0

        if self.ask_user_confirmation(ignore_prompt):
            return

        logger.info("*************** NEW COMMAND ***************")
        logger.info("Destroying Building database...")
        Building.objects.all().delete()
        logger.debug("All buildings has been deleted from database. Building table is now empty.")

        cameras_to_import = self.get_cameras_from_file(logger, filename)

        self.stdout.write(
            f"Processing {len(cameras_to_import)} cameras...")

        with tqdm(total=len(cameras_to_import), desc="Processing cameras", unit=" cameras imported") as pbar_process:
            for camera in cameras_to_import:
                logger.debug(f"Working on {camera['id']}...")
                if self.camera_creation_using_overpass(camera, logger):
                    total_imported += 1
                else:
                    total_skipped += 1
                pbar_process.update(1)  # Update the progress bar

        logger.debug("End of camera processing")

        summary = (
            f"--- Summary ---\n"
            f"{total_imported} new cameras imported or updated\n"
            f"{total_skipped} cameras skipped (already existing)"
        )

        logger.info(summary)
        self.stdout.write(summary)

        end = timer()
        duration_msg = f"Time to execute {timedelta(seconds=end-start)}"
        logger.info(duration_msg)
        self.stdout.write(duration_msg)

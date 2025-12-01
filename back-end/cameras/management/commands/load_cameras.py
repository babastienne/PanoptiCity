from concurrent.futures import ProcessPoolExecutor
from datetime import timedelta
from timeit import default_timer as timer

import osmium
from cameras.services.camera_creation import process_camera_batch
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = """
    Load all cameras from osm file.
    This command can also be used to update existing cameras (using --update).
    It uses multiple processes to speed up the import. Each process handles a batch of cameras.
    Depending of your CPU and RAM, you can adjust the number of workers and batch size.
    """

    def add_arguments(self, parser):
        parser.add_argument(
            "camera_file", help="Mandatory parameter: path to file to import (osm.pbf or .osm format) [eg: /osm-data/sample-data.osm.pbf]"
        )
        parser.add_argument(
            "--update",
            "-u",
            action="store_true",
            default=False,
            dest="update_field",
            help="Force the update of cameras and related data",
        )
        parser.add_argument(
            "--details",
            "-d",
            action="store_true",
            dest="verbose_field",
            help="If parameter is set, show more logs",
        )
        parser.add_argument(
            "--batch-size",
            "-b",
            type=int,
            default=100,
            dest="batch_size_field",
            help="Number of cameras to process in each batch (default: 100)",
        )
        parser.add_argument(
            "--max-workers",
            "-w",
            type=int,
            default=4,
            dest="max_workers_field",
            help="Number of worker processes to use (default: 4)",
        )

    def extract_node_data(self, elem):
        """
        Extracts data from osmium node into a plain python dict.
        We cannot pass the 'elem' object to workers because it's C++.
        """
        return {
            'id': elem.id,
            'lon': elem.location.lon,
            'lat': elem.location.lat,
            'tags': dict(elem.tags),  # Convert osmium TagList to python dict
        }

    def handle(self, *args, **options):
        start = timer()

        filename = options["camera_file"]
        update = options.get("update_field")
        verbose = options.get("verbose_field")
        batch_size = options.get("batch_size_field")
        max_workers = options.get("max_workers_field")

        total_imported = 0
        total_skipped = 0

        current_batch = []
        futures = []

        print(
            f"INFO: Starting import from {filename} with {max_workers} workers...")

        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            for elem in osmium.FileProcessor(filename, osmium.osm.NODE).with_filter(
                osmium.filter.TagFilter(("man_made", "surveillance"))
            ):
                data = self.extract_node_data(elem)
                current_batch.append(data)

                # If batch is full, send to worker
                if len(current_batch) >= batch_size:
                    # Submit task
                    future = executor.submit(
                        process_camera_batch, current_batch, update, verbose)
                    futures.append(future)
                    current_batch = []  # Reset

            # Handle remaining cameras in the last batch
            if current_batch:
                futures.append(executor.submit(
                    process_camera_batch, current_batch, update, verbose))

            for future in futures:
                try:
                    imported, skipped = future.result()
                    total_imported += imported
                    total_skipped += skipped
                    print(
                        f"INFO: Batch finished. +{imported} cameras (skipped {skipped}).")
                except Exception as e:
                    self.stderr.write(
                        f"ERROR: Batch failed: {e}"
                    )

        self.stdout.write(
            f"--- Summary ---\n{total_imported} new cameras imported or updated\n{total_skipped} cameras skipped (already existing)"
        )
        end = timer()
        self.stdout.write(f"Time to execute {timedelta(seconds=end-start)}")

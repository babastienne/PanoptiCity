import logging
from concurrent.futures import ProcessPoolExecutor, as_completed
from datetime import timedelta
from timeit import default_timer as timer

import osmium
from cameras.services.camera_creation import process_camera_batch
from cameras.services.utils import extract_node_data, setup_logger
from django.core.management.base import BaseCommand
from tqdm import tqdm


class Command(BaseCommand):
    help = """
    Load all cameras from osm file.
    This command can also be used to recreate existing cameras (using --recreate).
    It uses multiple processes to speed up the import. Each process handles a batch of cameras.
    Depending of your CPU and RAM, you can adjust the number of workers and batch size.
    Logs are written to a file (default: import_cameras.log) to keep track of progress and errors.
    """

    def add_arguments(self, parser):
        parser.add_argument(
            "camera_file",
            help="Mandatory parameter: path to file to import (osm.pbf or .osm format) [eg: /osm-data/sample-data.osm.pbf]",
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
            help="If parameter is set, include detailed logs in the log file",
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
        parser.add_argument(
            "--log-file",
            "-l",
            type=str,
            default="import_cameras.log",
            dest="log_file",
            help="Path to the output log file (default: load_cameras.log)",
        )

    def handle(self, *args, **options):
        start = timer()

        filename = options["camera_file"]
        update = options.get("update_field")
        verbose = options.get("verbose_field")
        batch_size = options.get("batch_size_field")
        max_workers = options.get("max_workers_field")
        log_file = options.get("log_file")

        # Setup logging
        logger = self.setup_logger(log_file, verbose)
        self.stdout.write(f"Logs will be written to: {log_file}")

        total_imported = 0
        total_skipped = 0

        current_batch = []
        futures = []

        self.stdout.write(
            f"Starting import from {filename} with {max_workers} workers...")
        logger.info(
            f"Starting import from {filename} with {max_workers} workers.")

        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            with tqdm(desc="Reading OSM file", unit=" cameras found") as pbar_read:

                # Phase 1: Reading OSM file and dispatching batches to workers
                for elem in osmium.FileProcessor(filename, osmium.osm.NODE).with_filter(
                    osmium.filter.TagFilter(("man_made", "surveillance"))
                ):
                    data = extract_node_data(elem)
                    current_batch.append(data)
                    pbar_read.update(1)

                    # If batch is full, send to worker
                    if len(current_batch) >= batch_size:
                        future = executor.submit(
                            process_camera_batch, current_batch, update, verbose, log_file
                        )
                        futures.append(future)
                        current_batch = []  # Reset

                # Handle remaining cameras in the last batch
                if current_batch:
                    futures.append(executor.submit(
                        process_camera_batch, current_batch, update, verbose, log_file
                    ))

            # Phase 2: Waiting for results
            self.stdout.write(
                f"Processing {len(futures)} batches of {batch_size} cameras...")

            with tqdm(total=len(futures), desc="Processing cameras", unit=" batch") as pbar_process:
                for future in as_completed(futures):
                    try:
                        imported, skipped = future.result()
                        total_imported += imported
                        total_skipped += skipped

                        logger.info(
                            f"Batch finished. +{imported} cameras (skipped {skipped}).")

                        # Update progress bar description with live stats
                        pbar_process.set_postfix(
                            new=total_imported, skip=total_skipped)
                        pbar_process.update(1)

                    except Exception as e:
                        error_msg = f"Batch failed: {e}"
                        logger.error(error_msg)
                        # Print error to console without breaking tqdm
                        pbar_process.write(f"ERROR: {error_msg}")

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

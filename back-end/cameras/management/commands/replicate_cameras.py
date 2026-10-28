"""
Long-running service keeping cameras in sync with OpenStreetMap minutely diffs.

It replaces the former bash loop + Overpass API: diffs are downloaded with pyosmium, camera
changes are applied by CameraUpdater, and buildings come from the configured provider
(see cameras.services.buildings). The applied sequence is stored in the database.

Processing a batch is idempotent (every change is keyed by node id and holds the latest
version), so if the service stops between applying changes and saving the sequence, the
batch is simply applied again on restart.
"""
import logging
import re
import sys
import time
from pathlib import Path

import osmium
import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from osmium.replication.server import ReplicationServer

from cameras.models import ReplicationState
from cameras.services.buildings import get_building_provider
from cameras.services.camera_update import CameraUpdater
from cameras.services.utils import extract_node_data

MAX_BACKOFF_SECONDS = 900


class CameraChangesHandler(osmium.SimpleHandler):
    """
    Collect the final state of every node of a change file.
    Cameras are kept with their data; every other node is a candidate for deletion
    (deleted node, or `man_made=surveillance` tag removed) and is checked against the database.
    """

    def __init__(self):
        super().__init__()
        self.changes = {}

    def node(self, n):
        if not n.deleted and n.tags.get("man_made") == "surveillance":
            self.changes[n.id] = extract_node_data(n)
        else:
            self.changes[n.id] = None


def read_state_file(path):
    """
    Read a sequence number from a pyosmium/osmosis state file ("sequenceNumber=123" or "123").
    """
    text = Path(path).read_text(encoding="utf-8")
    match = re.search(r"sequenceNumber=(\d+)", text) or re.search(r"^\s*(\d+)\s*$", text, re.M)
    if not match:
        raise CommandError(f"No sequence number found in {path}")
    return int(match.group(1))


class Command(BaseCommand):
    help = "Follow OSM replication diffs and keep cameras (and their focus) up to date."

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger("cameras.replication")

    def add_arguments(self, parser):
        parser.add_argument("--once", action="store_true",
                            help="Apply all available diffs, retry pending cameras, then exit.")
        parser.add_argument("--osc", dest="osc_file",
                            help="Apply a local change file (.osc / .osc.gz) and exit. The replication state is not modified.")
        parser.add_argument("--init-sequence", type=int, dest="init_sequence",
                            help="Initialise (or reset) the replication state to this sequence number.")
        parser.add_argument("--sleep", type=int, default=60,
                            help="Seconds to wait when no new diff is available (default: 60).")
        parser.add_argument("--max-size", type=int, default=20 * 1024, dest="max_size",
                            help="Maximum unpacked size of diffs processed in one batch, in kB (default: 20480).")
        parser.add_argument("--retry-every", type=int, default=10, dest="retry_every",
                            help="Minutes between two retries of cameras computed without buildings (default: 10).")
        parser.add_argument("--retry-limit", type=int, default=200, dest="retry_limit",
                            help="Maximum number of pending cameras retried at once (default: 200).")
        parser.add_argument("--log-file", "-l", default="replication.log", dest="log_file",
                            help="Log file path (default: replication.log).")
        parser.add_argument("--details", "-d", action="store_true", dest="verbose",
                            help="Include debug logs.")

    # --- Setup ------------------------------------------------------------------------

    def _setup_logger(self, log_file, verbose):
        logger = logging.getLogger("cameras.replication")
        logger.setLevel(logging.DEBUG if verbose else logging.INFO)
        logger.handlers.clear()
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
        for handler in (logging.StreamHandler(sys.stdout), logging.FileHandler(log_file, mode="a")):
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        logger.propagate = False
        return logger

    def _load_state(self, server_url, init_sequence):
        state = ReplicationState.objects.first()
        if init_sequence is not None:
            state = state or ReplicationState()
            state.server_url = server_url
            state.sequence = init_sequence
            state.save()
            self.logger.info("Replication state set to sequence %s", init_sequence)
            return state
        if state is None:
            state_file = Path(settings.REPLICATION_STATE_FILE)
            if not state_file.is_file():
                raise CommandError(
                    f"No replication state in database and no state file at {state_file}. "
                    "Use --init-sequence to set the starting sequence.")
            state = ReplicationState.objects.create(
                server_url=server_url, sequence=read_state_file(state_file))
            self.logger.info("Replication state initialised from %s: sequence %s", state_file, state.sequence)
        elif state.server_url.rstrip("/") != server_url.rstrip("/"):
            raise CommandError(
                f"Stored state belongs to {state.server_url} but REPLICATION_SERVER_URL is {server_url}. "
                "Sequence numbers differ between servers: use --init-sequence to reset the state.")
        return state

    # --- Main loop --------------------------------------------------------------------

    def handle(self, *args, **options):
        self.logger = self._setup_logger(options["log_file"], options["verbose"])
        provider = get_building_provider(self.logger)
        updater = CameraUpdater(provider, self.logger)
        self.logger.info("Buildings provider: %s", provider.name)

        if options["osc_file"]:
            handler = CameraChangesHandler()
            handler.apply_file(options["osc_file"])
            self.logger.info("Change file %s: %s", options["osc_file"], updater.apply(handler.changes))
            return

        server_url = settings.REPLICATION_SERVER_URL
        state = self._load_state(server_url, options["init_sequence"])
        server = ReplicationServer(server_url)
        server.set_request_parameter("headers", {
            "User-Agent": "PanoptiCity replication (+https://github.com/babastienne/PanoptiCity)"})

        backoff = 60
        last_retry = 0
        self.logger.info("Following %s from sequence %s", server_url, state.sequence)

        while True:
            provider.maintenance()
            try:
                result = server.collect_diffs(state.sequence + 1, max_size=options["max_size"])
            except (requests.RequestException, OSError, RuntimeError) as e:
                # Transient errors (network, diff announced but not yet published, ...): retry
                self.logger.warning("Cannot download diffs after sequence %s: %s. Retrying in %ss",
                                    state.sequence, e, backoff)
                if options["once"]:
                    return
                time.sleep(backoff)
                backoff = min(backoff * 2, MAX_BACKOFF_SECONDS)
                continue
            backoff = 60

            caught_up = result is None
            if result is not None:
                handler = CameraChangesHandler()
                result.reader.apply(handler, simplify=True)
                stats = updater.apply(handler.changes)
                state.sequence = result.id
                info = server.get_state_info(result.id)
                state.sequence_timestamp = info.timestamp if info else None
                state.save()
                self.logger.info("Sequence %s (%s): %s", state.sequence, state.sequence_timestamp, stats)
                caught_up = result.id >= result.newest

            if caught_up and time.time() - last_retry >= options["retry_every"] * 60:
                last_retry = time.time()
                stats = updater.retry_pending(options["retry_limit"])
                if stats.created or stats.recomputed or stats.errors:
                    self.logger.info("Retry of pending cameras: %s", stats)

            if caught_up:
                if options["once"]:
                    return
                time.sleep(options["sleep"])

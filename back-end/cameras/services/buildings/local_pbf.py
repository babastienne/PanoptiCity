"""
Buildings read from a local OSM extract (.osm.pbf), typically the file used for the
initial import.

For each replication batch, `osmium extract` cuts all the requested areas out of the file in
a single pass (C++, fast), then buildings are read from those small extracts with pyosmium.
The file is kept up to date with the official OSM replication diffs (`pyosmium-up-to-date`),
so this provider needs no third-party service at all. It is well suited to installations
covering a city, a region or a country; the planet file is too large for a small server.
"""
import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

import osmium
from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry

from cameras.services.buildings.base import (BuildingProvider,
                                             BuildingProviderUnavailable,
                                             split_polygons)

# Margin added around each area so that buildings crossing the area border are complete
BBOX_MARGIN_DEGREES = 0.001
# osmium keeps one output buffer per extract: limit the number of extracts per pass
MAX_EXTRACTS_PER_PASS = 200
EXTRACT_TIMEOUT_SECONDS = 3600


class LocalPbfBuildingProvider(BuildingProvider):
    name = "local"

    def __init__(self, pbf_path, logger=None, update_interval_hours=None):
        super().__init__(logger)
        self.pbf_path = Path(pbf_path) if pbf_path else None
        if update_interval_hours is None:
            update_interval_hours = getattr(settings, "BUILDINGS_LOCAL_UPDATE_HOURS", 24)
        self.update_interval = update_interval_hours * 3600
        self.last_update = 0
        self.wkb_factory = osmium.geom.WKBFactory()

    def _check_ready(self):
        if not self.pbf_path or not self.pbf_path.is_file():
            raise BuildingProviderUnavailable(
                f"Local buildings file not found: {self.pbf_path} (set BUILDINGS_LOCAL_PBF)")
        if not shutil.which("osmium"):
            raise BuildingProviderUnavailable("osmium-tool is not installed")

    def _read_buildings(self, path):
        buildings = []
        for obj in osmium.FileProcessor(str(path)).with_areas():
            if not obj.is_area():
                continue
            building = obj.tags.get("building")
            if not building or building == "roof":
                continue
            try:
                wkb = self.wkb_factory.create_multipolygon(obj)
                geom = GEOSGeometry(wkb, srid=4326)
            except Exception:
                continue
            for polygon in split_polygons(geom):
                if polygon.valid and not polygon.empty:
                    buildings.append((obj.orig_id(), polygon))
        return buildings

    def _extract(self, areas, workdir):
        extracts = []
        for i, area in enumerate(areas):
            xmin, ymin, xmax, ymax = area.extent
            extracts.append({
                "output": f"area_{i}.osm.pbf",
                "bbox": [xmin - BBOX_MARGIN_DEGREES, ymin - BBOX_MARGIN_DEGREES,
                         xmax + BBOX_MARGIN_DEGREES, ymax + BBOX_MARGIN_DEGREES],
            })
        config = Path(workdir) / "extracts.json"
        config.write_text(json.dumps({"directory": str(workdir), "extracts": extracts}))
        try:
            subprocess.run(
                ["osmium", "extract", "--config", str(config), "--strategy", "smart",
                 "--overwrite", "--no-progress", str(self.pbf_path)],
                check=True, capture_output=True, text=True, timeout=EXTRACT_TIMEOUT_SECONDS,
            )
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
            stderr = getattr(e, "stderr", "") or ""
            raise BuildingProviderUnavailable(f"osmium extract failed: {stderr.strip() or e}") from e
        return [Path(workdir) / e["output"] for e in extracts]

    def fetch_for_areas(self, areas):
        if not areas:
            return []
        self._check_ready()
        results = []
        for start in range(0, len(areas), MAX_EXTRACTS_PER_PASS):
            chunk = areas[start:start + MAX_EXTRACTS_PER_PASS]
            with tempfile.TemporaryDirectory(prefix="panopticity-buildings-") as workdir:
                outputs = self._extract(chunk, workdir)
                for area, output in zip(chunk, outputs):
                    prepared_area = area.prepared
                    results.append([
                        (osm_id, polygon) for osm_id, polygon in self._read_buildings(output)
                        if prepared_area.intersects(polygon)
                    ])
        return results

    def maintenance(self):
        """
        Apply OSM diffs to the local file once every BUILDINGS_LOCAL_UPDATE_HOURS hours.
        """
        if not self.update_interval or time.time() - self.last_update < self.update_interval:
            return
        self.last_update = time.time()
        try:
            self._check_ready()
        except BuildingProviderUnavailable as e:
            self.logger.warning("Skipping local buildings file update: %s", e)
            return

        self.logger.info("Updating local buildings file %s", self.pbf_path)
        # pyosmium-up-to-date applies at most --size MB per run: loop until up to date
        for _ in range(50):
            try:
                proc = subprocess.run(
                    ["pyosmium-up-to-date", "--size", "1024", str(self.pbf_path)],
                    capture_output=True, text=True, timeout=EXTRACT_TIMEOUT_SECONDS, check=False,
                    env={**os.environ, "TMPDIR": str(self.pbf_path.parent)},
                )
            except subprocess.TimeoutExpired:
                self.logger.error("Local buildings file update timed out")
                return
            # 0 = up to date, 1 = some diffs applied but more are available
            if proc.returncode == 1:
                continue
            if proc.returncode == 0:
                self.logger.info("Local buildings file is up to date")
            else:
                self.logger.error("Local buildings file update failed (code %s): %s",
                                  proc.returncode, proc.stderr.strip()[-500:])
            return

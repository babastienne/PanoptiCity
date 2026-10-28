"""
Buildings from the Overture Maps Foundation monthly release (GeoParquet files on S3).

Overture republishes OpenStreetMap buildings every month as spatially sorted GeoParquet
files. Each file is described in a STAC catalog with its bounding box, so a query for a
small area only reads the few files (usually one) that may contain it, through HTTP range
requests. Nothing is stored locally except the small STAC file index.

Data is roughly one month old, which is acceptable for buildings (cameras themselves are
still updated every minute from OSM diffs).
"""
import concurrent.futures
import json
import os
import re
import time
from pathlib import Path

import duckdb
import requests
from django.conf import settings

from cameras.services.buildings.base import (BuildingProvider,
                                             BuildingProviderUnavailable,
                                             polygons_from_wkb)

STAC_ROOT = "https://stac.overturemaps.org"
# How often the "latest" release is looked up again
RELEASE_REFRESH_SECONDS = 24 * 3600
OSM_RECORD_RE = re.compile(r"^[wr](\d+)")


class OvertureBuildingProvider(BuildingProvider):
    name = "overture"

    def __init__(self, release="latest", osm_only=True, logger=None):
        super().__init__(logger)
        self.requested_release = release
        self.osm_only = osm_only
        # Current release, time it was checked, and its files [((xmin, ymin, xmax, ymax), url)]
        self.release = None
        self.release_checked_at = 0
        self.files = []
        self.session = requests.Session()
        self.session.headers["User-Agent"] = "PanoptiCity (+https://github.com/babastienne/PanoptiCity)"
        self.con = None

    # --- Release and file index -------------------------------------------------------

    def _get_json(self, url):
        resp = self.session.get(url, timeout=60)
        resp.raise_for_status()
        return resp.json()

    def _resolve_release(self):
        if self.requested_release != "latest":
            return self.requested_release
        return self._get_json(f"{STAC_ROOT}/catalog.json")["latest"]

    def _load_file_index(self, release, use_cache=True):
        """
        Return [((xmin, ymin, xmax, ymax), url), ...] for every building file of a release.
        The index is cached on disk because building it takes ~20s (512 small requests).
        """
        cache_dir = Path(getattr(settings, "BUILDINGS_CACHE_DIR", "/tmp"))
        cache_file = cache_dir / f"overture-buildings-{release}.json"
        if use_cache and cache_file.exists():
            return [(tuple(b), u) for b, u in json.loads(cache_file.read_text())]

        base = f"{STAC_ROOT}/{release}/buildings/building"
        collection = self._get_json(f"{base}/collection.json")
        item_urls = [link["href"] for link in collection["links"] if link["rel"] == "item"]
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            items = list(pool.map(self._get_json, item_urls))
        files = [(tuple(item["bbox"]), item["assets"]["aws"]["href"]) for item in items]

        try:
            cache_dir.mkdir(parents=True, exist_ok=True)
            tmp = cache_file.with_suffix(".tmp")
            tmp.write_text(json.dumps(files))
            os.replace(tmp, cache_file)
        except OSError as e:
            self.logger.warning("Could not cache Overture file index: %s", e)
        return files

    def _ensure_index(self, force=False):
        now = time.time()
        if not force and self.files and now - self.release_checked_at < RELEASE_REFRESH_SECONDS:
            return
        try:
            release = self._resolve_release()
            if force or release != self.release or not self.files:
                self.files = self._load_file_index(release, use_cache=not force)
                if release != self.release:
                    self.logger.info("Using Overture buildings release %s (%d files)", release, len(self.files))
                self.release = release
            self.release_checked_at = now
        except (requests.RequestException, KeyError, ValueError) as e:
            if self.files:
                # Keep using the known release if the catalog is temporarily unreachable
                self.logger.warning("Overture catalog unreachable, keeping release %s: %s", self.release, e)
                return
            raise BuildingProviderUnavailable(f"Overture catalog unreachable: {e}") from e

    def _connection(self):
        if self.con is None:
            con = duckdb.connect()
            # httpfs is installed in the docker image at build time
            con.execute("LOAD httpfs;")
            con.execute("SET http_retries = 3;")
            con.execute("SET enable_object_cache = true;")
            self.con = con
        return self.con

    # --- Queries ----------------------------------------------------------------------

    def _files_for_bbox(self, xmin, ymin, xmax, ymax):
        return [url for (bx0, by0, bx1, by1), url in self.files
                if bx0 <= xmax and bx1 >= xmin and by0 <= ymax and by1 >= ymin]

    def _query_bbox(self, xmin, ymin, xmax, ymax):
        files = self._files_for_bbox(xmin, ymin, xmax, ymax)
        if not files:
            return []
        source_filter = (
            "AND list_contains(list_transform(sources, lambda s: s.dataset), 'OpenStreetMap')"
            if self.osm_only else ""
        )
        query = f"""
            SELECT geometry,
                   list_filter(sources, lambda s: s.dataset = 'OpenStreetMap')[1].record_id
            FROM read_parquet(?)
            WHERE bbox.xmin <= ? AND bbox.xmax >= ? AND bbox.ymin <= ? AND bbox.ymax >= ?
              AND coalesce(class, '') <> 'roof'
              AND NOT coalesce(is_underground, false)
              {source_filter}
        """
        return self._connection().execute(query, [files, xmax, xmin, ymax, ymin]).fetchall()

    def fetch_for_areas(self, areas):
        self._ensure_index()
        results = []
        for area in areas:
            xmin, ymin, xmax, ymax = area.extent
            try:
                rows = self._query_bbox(xmin, ymin, xmax, ymax)
            except duckdb.Error as e:
                # Files of an old release are deleted by Overture: reload the index once
                self.logger.warning("Overture query failed (%s), reloading release index", e)
                try:
                    self._ensure_index(force=True)
                    rows = self._query_bbox(xmin, ymin, xmax, ymax)
                except (duckdb.Error, BuildingProviderUnavailable) as e2:
                    # Only this area is affected: its camera is retried later
                    self.logger.warning("Overture query failed for area %s: %s", area.extent, e2)
                    results.append(None)
                    continue

            prepared_area = area.prepared
            buildings = []
            for wkb, record_id in rows:
                match = OSM_RECORD_RE.match(record_id or "")
                osm_id = int(match.group(1)) if match else 0
                for polygon in polygons_from_wkb(wkb):
                    if prepared_area.intersects(polygon):
                        buildings.append((osm_id, polygon))
            results.append(buildings)
        return results

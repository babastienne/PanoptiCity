"""
Apply OpenStreetMap camera changes to the database.

Each change is classified against what is already stored:
- the camera disappeared (node deleted or `man_made=surveillance` removed): delete it;
- only descriptive tags changed: update fields and tags, keep the computed focus;
- the camera is new, moved, or a tag used by the focus computation changed: recompute
  the focus with the buildings returned by the configured buildings provider.

Every camera is processed in its own transaction: a failure never deletes or corrupts an
existing camera. When the buildings provider is unavailable, the focus is computed without
buildings and the camera is flagged `buildings_pending` to be retried later.
"""
from dataclasses import dataclass, field

from django.db import transaction
from django.db.models import Min

from cameras.models import Building, Camera, CameraFocus, CameraTags
from cameras.services.buildings import BuildingProviderUnavailable
from cameras.services.camera_creation import build_camera
from cameras.services.utils import (get_tiles_for_polygon, purge_camera_tiles,
                                    purge_focus_tiles)

# Camera fields that change the computed focus. A change limited to other fields
# (mount, zone, surveillance:type, free tags) does not require buildings.
FOV_FIELDS = ("camera_type", "direction", "angle", "height", "surveillance")
# Fields updated in place when the focus does not need to be recomputed
DESCRIPTIVE_FIELDS = ("mount", "surveillance_type", "zone")
ID_QUERY_CHUNK = 10000


@dataclass
class UpdateStats:
    created: int = 0
    recomputed: int = 0
    tags_only: int = 0
    deleted: int = 0
    pending: int = 0
    errors: int = 0
    error_ids: list = field(default_factory=list)

    def __str__(self):
        return (f"{self.created} created, {self.recomputed} recomputed, {self.tags_only} tags only, "
                f"{self.deleted} deleted, {self.pending} without buildings (pending), {self.errors} errors")


def fov_inputs_changed(old, new):
    """
    Return True if the focus of `old` (stored camera) must be recomputed to match `new`.
    """
    if not old.location.equals_exact(new.location, tolerance=1e-7):
        return True
    return any(getattr(old, f) != getattr(new, f) for f in FOV_FIELDS)


def camera_data_from_db(camera):
    """
    Rebuild the raw OSM dict of a stored camera from its tags (used to retry pending cameras).
    """
    return {
        "id": camera.id,
        "lon": camera.location.x,
        "lat": camera.location.y,
        "tags": dict(CameraTags.objects.filter(camera_id=camera).values_list("name", "value")),
    }


def observation_tiles(camera_id):
    """
    Tiles (x, y, z, scenario) covered by the observation focus of a stored camera.
    """
    tiles = set()
    for focus in CameraFocus.objects.filter(camera_id=camera_id, level="observation"):
        if focus.geom:
            for x, y, z in get_tiles_for_polygon(focus.geom):
                tiles.add((x, y, z, focus.scenario))
    return tiles


def _largest_focus(focus_list):
    """
    The worst scenario observation focus is the largest area a camera can see:
    buildings outside of it can never limit the camera's field of view.
    """
    for focus in focus_list:
        if focus.scenario == "worst" and focus.level == "observation":
            return focus.geom
    return None


class CameraUpdater:
    def __init__(self, provider, logger):
        self.provider = provider
        self.logger = logger
        # Pending cameras are retried in id order, round-robin, so that a camera that
        # always fails cannot prevent the others from being retried
        self.retry_cursor = 0

    # --- Entry points -----------------------------------------------------------------

    def apply(self, changes):
        """
        :param changes: dict {node_id: camera_osm dict, or None if the node is no longer a camera}
        :return: UpdateStats
        """
        stats = UpdateStats()
        existing = self._existing_cameras(list(changes))

        to_compute = []
        for node_id, data in changes.items():
            old = existing.get(node_id)
            if data is None:
                if old is not None:
                    self._run(stats, node_id, self._delete, old)
                continue
            try:
                new, new_tags = build_camera(data, self.logger)
            except Exception as e:
                self.logger.error("Camera #%s: cannot read OSM data: %s", node_id, e)
                stats.errors += 1
                stats.error_ids.append(node_id)
                continue
            if old is not None and not fov_inputs_changed(old, new):
                self._run(stats, node_id, self._update_tags_only, old, new, new_tags)
            else:
                to_compute.append((new, new_tags, old))

        self._compute_and_save(to_compute, stats)
        return stats

    def retry_pending(self, limit):
        """
        Recompute up to `limit` cameras whose focus was computed without buildings.
        """
        stats = UpdateStats()
        cameras = list(Camera.objects.filter(buildings_pending=True, id__gt=self.retry_cursor)
                       .order_by("id")[:limit])
        self.retry_cursor = cameras[-1].id if len(cameras) == limit else 0
        to_compute = []
        for old in cameras:
            try:
                new, new_tags = build_camera(camera_data_from_db(old), self.logger)
            except Exception as e:
                self.logger.error("Camera #%s: cannot rebuild from database: %s", old.id, e)
                stats.errors += 1
                continue
            to_compute.append((new, new_tags, old))
        self._compute_and_save(to_compute, stats)
        return stats

    # --- Internals --------------------------------------------------------------------

    @staticmethod
    def _existing_cameras(ids):
        existing = {}
        for start in range(0, len(ids), ID_QUERY_CHUNK):
            existing.update(Camera.objects.in_bulk(ids[start:start + ID_QUERY_CHUNK]))
        return existing

    def _run(self, stats, camera_id, func, *args):
        try:
            func(stats, *args)
        except Exception as e:
            self.logger.exception("Camera #%s: update failed, previous version kept: %s", camera_id, e)
            stats.errors += 1
            stats.error_ids.append(camera_id)

    def _delete(self, stats, camera):
        tiles = observation_tiles(camera.id)
        with transaction.atomic():
            CameraFocus.objects.filter(camera_id=camera.id).delete()
            CameraTags.objects.filter(camera_id=camera.id).delete()
            Camera.objects.filter(id=camera.id).delete()
            transaction.on_commit(lambda: self._purge(camera, tiles))
        self.logger.debug("Camera #%s deleted", camera.id)
        stats.deleted += 1

    def _update_tags_only(self, stats, old, new, new_tags):
        with transaction.atomic():
            for f in DESCRIPTIVE_FIELDS:
                setattr(old, f, getattr(new, f))
            old.save(update_fields=list(DESCRIPTIVE_FIELDS))
            CameraTags.objects.filter(camera_id=old.id).delete()
            for tag in new_tags:
                tag.camera_id = old
            CameraTags.objects.bulk_create(new_tags)
            transaction.on_commit(lambda: self._purge(old, set()))
        self.logger.debug("Camera #%s: tags updated, focus kept", old.id)
        stats.tags_only += 1

    def _compute_and_save(self, to_compute, stats):
        if not to_compute:
            return

        # 1. Focus without buildings: gives the area where buildings are needed
        areas, area_owner = [], []
        for idx, (camera, _, _) in enumerate(to_compute):
            try:
                area = _largest_focus(camera.generate_focus([]))
            except Exception as e:
                self.logger.warning("Camera #%s: cannot compute focus area: %s", camera.id, e)
                area = None
            if area is not None:
                areas.append(area)
                area_owner.append(idx)

        # 2. One provider call for the whole batch. A None result means that the
        # buildings of this area could not be fetched.
        buildings_by_camera = {idx: None for idx in area_owner}
        if areas:
            try:
                for idx, buildings in zip(area_owner, self.provider.fetch_for_areas(areas)):
                    buildings_by_camera[idx] = buildings
            except BuildingProviderUnavailable as e:
                self.logger.warning("Buildings provider unavailable, focus computed without buildings: %s", e)

        # 3. Each camera in its own transaction
        for idx, item in enumerate(to_compute):
            buildings = buildings_by_camera.get(idx, [])
            pending = buildings is None
            try:
                self._save_computed(stats, item, buildings or [], pending)
            except Exception as e:
                self._save_fallback(stats, item, idx in buildings_by_camera, e)

    def _save_fallback(self, stats, item, has_area, error):
        """
        Last resort when the computation with buildings failed: save the camera with a
        focus computed without buildings, so that a new camera is never lost and is
        retried later.
        """
        camera = item[0]
        self.logger.exception("Camera #%s: computation failed (%s), saving without buildings", camera.id, error)
        try:
            self._save_computed(stats, item, [], has_area)
        except Exception as e:
            self.logger.exception("Camera #%s: update failed, previous version kept: %s", camera.id, e)
            stats.errors += 1
            stats.error_ids.append(camera.id)

    def _save_computed(self, stats, item, buildings, pending):
        camera, tags, old = item
        for tag in tags:
            # Objects may keep a primary key from a rolled back attempt
            tag.pk = None
        old_tiles = observation_tiles(camera.id) if old is not None else set()
        with transaction.atomic():
            if old is not None:
                CameraFocus.objects.filter(camera_id=camera.id).delete()
                CameraTags.objects.filter(camera_id=camera.id).delete()

            if buildings:
                # Buildings only live inside this transaction: they are used for the
                # computation and removed before commit, so the table stays empty.
                start = min(Building.objects.aggregate(m=Min("id"))["m"] or 0, 0) - 1
                temp = [Building(id=start - i, osm_id=osm_id, geom=geom, tile=camera.tile)
                        for i, (osm_id, geom) in enumerate(buildings)]
                Building.objects.bulk_create(temp, batch_size=5000)
                temp_qs = Building.objects.filter(id__lte=start, id__gt=start - len(temp))
                focus = camera.generate_focus(temp_qs.only("id", "geom"))
                temp_qs.delete()
            else:
                focus = camera.generate_focus([])

            camera.buildings_pending = pending
            camera.save()
            for tag in tags:
                tag.camera_id = camera
            CameraTags.objects.bulk_create(tags)
            for f in focus:
                f.camera_id = camera
            CameraFocus.objects.bulk_create(focus)

            new_tiles = old_tiles | observation_tiles(camera.id)
            transaction.on_commit(lambda: self._purge(camera, new_tiles))

        if pending:
            stats.pending += 1
        if old is None:
            stats.created += 1
        else:
            stats.recomputed += 1
        self.logger.debug("Camera #%s: focus computed with %d buildings%s", camera.id,
                          len(buildings), " (pending)" if pending else "")

    def _purge(self, camera, tiles):
        """Invalidate nginx cache; failures are not fatal (cache expires anyway)."""
        try:
            purge_camera_tiles(camera)
            if tiles:
                purge_focus_tiles(tiles)
        except Exception as e:
            self.logger.debug("Cache purge failed for camera #%s: %s", camera.id, e)

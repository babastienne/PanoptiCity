import logging

from django.contrib.gis.geos import GEOSGeometry, MultiPolygon, Polygon


class BuildingProviderUnavailable(Exception):
    """
    Raised when a provider cannot answer right now (network error, missing file, ...).
    The caller computes the focus without buildings and retries later.
    """


class BuildingProvider:
    """
    Interface of a source of buildings.

    Subclasses implement `fetch_for_areas`. Areas are batched so that providers needing a
    full scan of a file (local PBF) only do it once per replication batch.
    """
    name = "base"

    def __init__(self, logger=None):
        self.logger = logger or logging.getLogger(__name__)

    def fetch_for_areas(self, areas):
        """
        Return the buildings intersecting each area.

        :param areas: list of GEOS Polygon / MultiPolygon in EPSG:4326
        :return: list (same order as areas) of lists of tuples (osm_id, GEOS Polygon),
                 or None for an area whose buildings could not be fetched
        :raises BuildingProviderUnavailable: if the source cannot be reached at all
        """
        raise NotImplementedError

    def maintenance(self):
        """
        Hook called regularly by the replication service (e.g. to refresh a local file).
        """


class NoBuildingProvider(BuildingProvider):
    """
    Provider that never returns buildings: focus are computed without intersections.
    """
    name = "none"

    def fetch_for_areas(self, areas):
        return [[] for _ in areas]


def split_polygons(geom):
    """
    Return the list of Polygons of a Polygon or MultiPolygon (other types are ignored).
    """
    if isinstance(geom, Polygon):
        return [geom]
    if isinstance(geom, MultiPolygon):
        return list(geom)
    return []


def polygons_from_wkb(wkb):
    """
    Parse a WKB geometry into a list of valid EPSG:4326 Polygons.
    """
    try:
        geom = GEOSGeometry(memoryview(bytes(wkb)), srid=4326)
    except Exception:
        return []
    return [p for p in split_polygons(geom) if p.valid and not p.empty]

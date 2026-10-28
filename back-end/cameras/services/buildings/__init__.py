"""
Buildings providers: where surrounding buildings come from when a camera focus has to be
(re)computed after the initial import.

The database never stores every building of the covered area. When a camera is created or
moved, the provider is asked for the buildings intersecting the camera's largest possible
focus, they are used for the computation and then discarded.
"""
from django.conf import settings

from cameras.services.buildings.base import (BuildingProvider,
                                             BuildingProviderUnavailable,
                                             NoBuildingProvider)


def get_building_provider(logger=None):
    """
    Instantiate the provider configured with the BUILDINGS_PROVIDER setting.

    :param logger: logger used by the provider
    :return: a BuildingProvider instance
    """
    name = settings.BUILDINGS_PROVIDER
    if name == "overture":
        # Imported lazily so that duckdb is only required when this provider is used
        from cameras.services.buildings.overture import OvertureBuildingProvider  # pylint: disable=import-outside-toplevel
        return OvertureBuildingProvider(
            release=settings.BUILDINGS_OVERTURE_RELEASE,
            osm_only=settings.BUILDINGS_OVERTURE_OSM_ONLY,
            logger=logger,
        )
    if name == "local":
        from cameras.services.buildings.local_pbf import LocalPbfBuildingProvider  # pylint: disable=import-outside-toplevel
        return LocalPbfBuildingProvider(
            pbf_path=settings.BUILDINGS_LOCAL_PBF,
            logger=logger,
        )
    if name == "none":
        return NoBuildingProvider(logger=logger)
    raise ValueError(
        f"Unknown BUILDINGS_PROVIDER '{name}'. Expected 'overture', 'local' or 'none'.")


__all__ = ["BuildingProvider", "BuildingProviderUnavailable",
           "NoBuildingProvider", "get_building_provider"]

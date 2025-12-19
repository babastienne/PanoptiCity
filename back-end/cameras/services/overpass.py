import time

import requests
from cameras.constants import OVERPASS_URL
from cameras.models import Building
from django.contrib.gis.geos import Polygon


def get_buildings_in_polygon(search_area_polygon, logger):
    """
    Fetches buildings (excluding roofs) from Overpass API that fall within 
    the given Django Polygon.

    :param search_area_polygon: A Django GEOSGeometry (Polygon) object.
    :return: A list of Buildings
    """

    # Convert Django Polygon to Overpass 'poly' coordinate string.
    # Django stores (Lon, Lat), Overpass expects "Lat Lon Lat Lon..."
    # We take the exterior ring of the polygon.
    coords = []
    for point in search_area_polygon.exterior_ring:
        # Swap x (lon) and y (lat) because Overpass wants "Lat Lon"
        coords.append(f"{point[1]} {point[0]}")

    poly_string = " ".join(coords)

    # Build the Overpass QL Query
    # [out:json]; sets output format.
    # way["building"]["building"!="roof"] filters for buildings that are not roofs.
    # (poly:"...") filters by the boundary.
    # out geom; ensures the API returns coordinates for the ways.
    query = f"""
    [out:json][timeout:25];
    (
      way["building"]["building"!="roof"](poly:"{poly_string}");
    );
    out geom;
    """

    # Query the API
    max_retries = 3

    for attempt in range(1, max_retries + 1):
        try:
            logger.debug(
                f"Querying Overpass API (Attempt {attempt}/{max_retries})...")

            # timeout=60 will raise a requests.exceptions.Timeout if
            # the server does not send data for 60 seconds
            response = requests.post(
                OVERPASS_URL, data={'data': query}, timeout=60)
            response.raise_for_status()

            # If successful, parse json and break the loop
            data = response.json()
            break

        except requests.exceptions.RequestException as e:
            logger.info(f"Attempt {attempt} failed when fetching overpas: {e}")

            # If we have reached the maximum number of retries,
            # we re-raise the exception to stop the program/command.
            if attempt == max_retries:
                logger.error(
                    "Max retries reached when trying to reach overpass. Raising error.")
                raise e

            # It is best practice (especially with Overpass)
            # to wait a few seconds to let the server cool down.
            # We wait 5 seconds, then 10 seconds, etc.
            wait_time = 5 * attempt
            logger.debug(f"Waiting {wait_time} seconds before retrying...")
            time.sleep(wait_time)

    results = []

    # Parse Results
    for element in data.get('elements', []):
        if element['type'] == 'way' and 'geometry' in element:
            osm_geometry = element['geometry']

            # 5. Convert OSM Geometry dict back to Django Polygon
            # OSM returns: [{'lat': ..., 'lon': ...}, ...]
            # Django wants: [(lon, lat), (lon, lat), ...]
            poly_coords = []
            for node in osm_geometry:
                poly_coords.append((node['lon'], node['lat']))

            # Ensure the polygon is closed (first point == last point)
            if poly_coords[0] != poly_coords[-1]:
                poly_coords.append(poly_coords[0])

            try:
                django_poly = Polygon(poly_coords, srid=4326)

                results.append(Building(
                    id=element['id'], osm_id=element['id'], geom=django_poly, tile='xxx'
                ))  # We don't care about the tile in those conditions
            except Exception as e:
                # Sometimes OSM returns self-intersecting or invalid geometries
                print(
                    f"Skipping invalid geometry for Way {element['id']}: {e}")

    return results

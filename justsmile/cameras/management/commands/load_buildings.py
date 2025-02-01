import overpy

from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Polygon

from cameras.models import Building


class Command(BaseCommand):
    help = 'Load all buildings from API calls'
    api = ""


    def add_arguments(self, parser):
        parser.add_argument('--bbox', '-b', action='store', dest='bbox_field', help='Bounding box to import data')
        parser.add_argument('--update', '-u', action='store_true', default=False, dest='update_field', help='Force update of buildings (can take some time)')
        parser.add_argument('--details', '-d', action='store_true', dest='verbose_field', help='If parameter is set, show more logs')


    def handle(self, *args, **options):
        bbox = options.get('bbox_field')
        update = options.get('update_field')
        self.verbose = options.get('verbose_field')

        bbox = "43.59000411748475,1.4119791984558108,43.59845816697428,1.4270746707916262"
        # FIXME: Small bbox = 43.59000411748475,1.4119791984558108,43.59845816697428,1.4270746707916262
        # FIXME: Medium bbox = 43.56702144054462,1.3820457458496094,43.60848803975705,1.502809524536133

        imported = 0
        skipped = 0

        try:
            self.api = overpy.Overpass()

            # fetch all ways and nodes
            result = self.fetch_data(bbox)
            # TODO: use BBOX parameter and spilt BBOX by multiple requests if too large to avoid timing out with API
            # TODO: Import large data from file instead of API / think about updating strategy

            total = len(result.ways)

            self.stdout.write(f"Found {total} buildings to import. Proceed")

            for way in result.ways:
                if update or not Building.objects.filter(id=way.id).exists():
                    imported += 1
                    self.create_building(way, total - skipped, imported)
                else:
                    if self.verbose:
                        self.stdout.write(f"Building #{way.id} already exists. Skipped.")
                    skipped += 1
        except Exception:
            raise

        self.stdout.write(f"--- Summary ---\n{imported} new buildings imported or updated\n{skipped} buildings skipped (already existing)")
    
    def fetch_data(self, bbox):
        query = f'[out:json][timeout:25];(way["building"]({bbox});relation["building"]({bbox}););out geom;'
        if self.verbose:
            self.stdout.write(f"Sending request to get data ...")
        result = self.api.query(query)
        if self.verbose:
            self.stdout.write(f"Got a response. Success")
        return result

    def create_building(self, building_overpass, total, imported):
        geometry = Polygon([[x.lat, x.lon] for x in building_overpass.get_nodes(resolve_missing=True)], srid=4326)
        building = Building.objects.get_or_create(
            id=building_overpass.id,
            geom = geometry
        )

        if self.verbose:
            if building[1]:
                self.stdout.write(f"{imported}/{total} Building #{building_overpass.id} created.")
            else:
                self.stdout.write(f"{imported}/{total} Building #{building_overpass.id} updated.")

        return building

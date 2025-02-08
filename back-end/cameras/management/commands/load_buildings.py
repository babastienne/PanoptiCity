import osmium

from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Polygon

from cameras.models import Building


class Command(BaseCommand):
    help = 'Load all buildings from osm file'

    def add_arguments(self, parser):
        parser.add_argument('building_file', help="Mandatory parameter: path to file to import")
        parser.add_argument('--update', '-u', action='store_true', default=False, dest='update_field', help='Force update of buildings (can take some time)')
        parser.add_argument('--details', '-d', action='store_true', dest='verbose_field', help='If parameter is set, show more logs')


    def handle(self, *args, **options):
        filename = options['building_file']
        update = options.get('update_field')
        self.verbose = options.get('verbose_field')

        imported = 0
        skipped = 0
        total = 0

        try:
            for elem in osmium.FileProcessor(filename, osmium.osm.WAY).with_filter(osmium.filter.KeyFilter('building')):
                total += 1
            
            self.stdout.write(f"Found {total} buildings to import. Proceed")

            for elem in osmium.FileProcessor(filename).with_filter(osmium.filter.KeyFilter('building')).with_locations():
                if elem.is_way():
                    if update or not Building.objects.filter(id=elem.id).exists():
                        imported += 1
                        self.create_building(elem, "#", imported)
                        if imported % 10000 == 0:
                            self.stdout.write(f"Imported {imported} elements ..")
                    else:
                        if self.verbose:
                            self.stdout.write(f"Building #{elem.id} already exists. Skipped.")
                        skipped += 1

            # We remove buildings that are roofs
            total = 0
            for elem in osmium.FileProcessor(filename, osmium.osm.WAY).with_filter(osmium.filter.TagFilter(('building', 'roof'))):
                if Building.objects.filter(id=elem.id).exists():
                    Building.objects.filter(id=elem.id).delete()
                    total += 1
        except Exception:
            raise

        self.stdout.write(f"--- Summary ---\n{imported} new buildings imported or updated\n{skipped} buildings skipped (already existing)\nFound and removed {total} buildings that are roofs")

    def create_building(self, building_overpass, total, imported):
        try:
            geometry = Polygon([[x.lon, x.lat] for x in building_overpass.nodes], srid=4326)
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
        except Exception:
            pass
        return None
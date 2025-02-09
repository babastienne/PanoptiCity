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
            for elem in osmium.FileProcessor(filename).with_filter(osmium.filter.KeyFilter('building')):
                total += 1
            
            self.stdout.write(f"Found {total} buildings to import. Proceed")

            for elem in osmium.FileProcessor(filename).with_filter(osmium.filter.KeyFilter('building')).with_locations().with_areas():
                # if 'man_made' in elem.tags:
                if elem.tags['building'] != 'roof':
                    if elem.is_way():  # If the object is only a linestring / polygon
                        if not Building.objects.filter(osm_id=elem.id).exists():  # If it doesn't exists yet
                            imported += 1
                            self.create_building(elem.id, elem.nodes, total, imported)
                        elif update:  # Else if it exists but the command is an update
                            self.update_building(elem.id, elem.nodes, total, imported)
                        else: 
                            if self.verbose:
                                self.stdout.write(f"Building #{elem.id} already exists. Skipped.")
                            skipped += 1
                    if elem.is_area():  # If the object is a multipolygon
                        if update:  # If it is an update
                            # because it can contains multiple objects and we can't distinguish them (same id, different geoms)
                            # then we remove all buildings with this is and recreate them after
                            self.stdout.write(f"/!\ Warning, removing {Building.objects.filter(osm_id=elem.id).count()} buildings (area)")  # FIXME : Remove when sure it works
                            Building.objects.filter(osm_id=elem.id).delete()
                        for outer in elem.outer_rings():
                            if Building.objects.filter(osm_id=elem.id).count() != len(elem.outer_rings()):
                                if update:  # If it is an update
                                    # because it can contains multiple objects and we can't distinguish them (same id, different geoms)
                                    # then we remove all buildings with this is and recreate them after
                                    self.stdout.write(f"|-> Created a new Building with id {elem.id}")  # FIXME : Remove when sure it works
                                imported += 1
                                self.create_building(elem.id, outer, total, imported)
                                if imported % 10000 == 0:
                                    self.stdout.write(f"Imported {imported} elements ..")

            # self.stdout.write(f"Removing buildings that are roofs. Proceed")
            # # We remove buildings that are roofs
            # total = 0
            # for elem in osmium.FileProcessor(filename, osmium.osm.WAY).with_filter(osmium.filter.TagFilter(('building', 'roof'))):
            #     if Building.objects.filter(id=elem.id).exists():
            #         Building.objects.filter(id=elem.id).delete()
            #         total += 1
        except Exception:
            raise

        self.stdout.write(f"--- Summary ---\n{imported} new buildings imported or updated\n{skipped} buildings skipped (already existing)")

    def update_building(self, id_building, nodes_building, total, imported):
        try:
            print(id_building)
            print(nodes_building)
            print(nodes_building[0])
            geometry = Polygon([[x.lon, x.lat] for x in nodes_building], srid=4326)
            building = Building.objects.get(osm_id = id_building)
            building.geom = geometry
            building.save()
            if self.verbose:
                self.stdout.write(f"{imported}/{total} Building #{id_building} updated.")
            return building
        except Exception:
            raise
        return None

    def create_building(self, id_building, nodes_building, total, imported):
        try:
            geometry = Polygon([[x.lon, x.lat] for x in nodes_building], srid=4326)
            building = Building.objects.get_or_create(
                osm_id = id_building,
                geom = geometry
            )
            if self.verbose:
                self.stdout.write(f"{imported}/{total} Building #{id_building} created.")
            return building
        except Exception:
            pass
        return None
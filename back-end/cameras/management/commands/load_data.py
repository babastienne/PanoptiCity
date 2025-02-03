import osmium
import overpy

from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point, Polygon

from cameras.models import Camera, Building


class CoordHandler:
    def __init__(self, coord, dist, writer):
        self.center = osmium.osm.Location(*coord)
        self.dist = dist
        self.writer = writer
        self.id_tracker = osmium.IdTracker()
    def node(self, n):
        if osmium.geom.haversine_distance(self.center, n.location) <= self.dist:
            self.writer.add_node(n)
            self.id_tracker.add_node(n.id)
    def way(self, w):
        if self.id_tracker.contains_any_references(w):
            self.writer.add_way(w)
            self.id_tracker.add_way(w.id)

class Command(BaseCommand):
    help = 'Load all cameras from osm file'

    def add_arguments(self, parser):
        parser.add_argument('data_file', help="Mandatory parameter: path to file to import")
        parser.add_argument('--update-cameras', '-c', action='store_true', default=False, dest='update_camera_field', help='Force update of cameras (can take some time)')
        parser.add_argument('--update-buildings', '-b', action='store_true', default=False, dest='update_building_field', help='Force update of buildings (very long task)')
        parser.add_argument('--details', '-d', action='store_true', dest='verbose_field', help='If parameter is set, show more logs')

    def handle(self, *args, **options):
        self.filename = options['data_file']
        update_camera = options.get('update_camera_field')
        self.update_building = options.get('update_building_field')
        self.verbose = options.get('verbose_field')

        imported = 0
        skipped = 0

        try:
            self.api = overpy.Overpass()
            for elem in osmium.FileProcessor(self.filename, osmium.osm.NODE).with_filter(osmium.filter.KeyFilter('man_made')):
                    # When using the bracket notation, make sure the tag exists.
                if 'man_made' in elem.tags:
                    if elem.tags['man_made'] == 'surveillance':
                        if update_camera or not Camera.objects.filter(id=elem.id).exists():
                            self.handle_creation(elem)
                            imported += 1
                        else:
                            if self.verbose:
                                self.stdout.write(f"Camera #{elem.id} already exists. Skipped.")
                            skipped += 1
        except Exception:
            raise

        self.stdout.write(f"--- Summary ---\n{imported} new cameras imported or updated\n{skipped} cameras skipped (already existing)")

    def create_building(self, building_osm):
        try:
            # geometry = Polygon([[x.lat, x.lon] for x in building_osm.nodes], srid=4326)  #  osmium way
            geometry = Polygon([[x.lat, x.lon] for x in building_osm.get_nodes(resolve_missing=True)], srid=4326)  # overpy way
            building = Building.objects.get_or_create(
                id=building_osm.id,
                geom = geometry
            )
            if self.verbose:
                if building[1]:
                    self.stdout.write(f"Building #{building_osm.id} created.")
                else:
                    self.stdout.write(f"Building #{building_osm.id} updated.")
            return building
        except Exception:
            pass
        return None

    def compute_direction(self, tags, camera):
        direction = None
        if 'camera:direction' in tags:
            direction = tags['camera:direction']
        elif 'surveillance:direction' in tags:
            direction = tags['surveillance:direction']
        elif 'direction' in tags:
            direction = tags['direction']
        
        if type(direction) is str:
            direction = direction.lower()
            if (direction in ['n', 'north']):
                direction = 0
            elif (direction in ['ne']):
                direction = 45
            elif (direction in ['e', 'east']):
                direction = 90
            elif (direction in ['se']):
                direction = 135
            elif (direction in ['s', 'south']):
                direction = 180
            elif (direction in ['sw']):
                direction = 225
            elif (direction in ['w', 'west']):
                direction = 270
            elif (direction in ['nw']):
                direction = 315
        
        try:
            direction = int(direction) if direction else None
        except Exception:
            direction = None
            self.stderr.write(f"Camera #{camera.id}. Field : Direction. Expected int, found {direction}. Field kept empty.")

        return direction
    
    
    def fetch_building_data(self, bbox):
        query = f'[out:json][timeout:25];(way["building"]{bbox};relation["building"]{bbox};);out geom;'
        result = self.api.query(query)
        return result


    def handle_creation(self, camera_osm):
        # print("Start handler")
        # with osmium.SimpleWriter('tmp_buildings.opl', overwrite=True) as writer:
        #     osmium.apply(self.filename, CoordHandler((camera_osm.lon, camera_osm.lat), 300, writer))  # 300 meters radius around camera
        
        # print("Stopped handler")
        # try:
        #     for elem in osmium.FileProcessor('tmp_buildings.opl').with_filter(osmium.filter.KeyFilter('building')).with_locations():
        #         if elem.is_way():
        #             if self.update_building or not Building.objects.filter(id=elem.id).exists():
        #                 self.create_building(elem)
        #             else:
        #                 if self.verbose:
        #                     self.stdout.write(f"Building #{elem.id} already exists. Skipped.")
        # except Exception:
        #     raise
        try:
            buffer = str(Point([camera_osm.lat, camera_osm.lon], srid=4326).buffer(0.0005).extent)
            result = self.fetch_building_data(buffer)

            for way in result.ways:
                if self.update_building or not Building.objects.filter(id=way.id).exists():
                    self.create_building(way)
                else:
                    if self.verbose:
                            self.stdout.write(f"Building #{way.id} already exists. Skipped.")
        except Exception as e:
            raise e

        self.create_camera(camera_osm)

    def create_camera(self, camera_osm):
        camera, created = Camera.objects.get_or_create(
            id=camera_osm.id,
            location = Point([camera_osm.lat, camera_osm.lon], srid=4326)
        )
        tags = camera_osm.tags
        if 'description' in tags:
            camera.description = tags['description']
        if 'camera:mount' in tags:
            camera.mount = tags['camera:mount']
        if 'surveillance:type' in tags:
            camera.surveillance_type = tags['surveillance:type']
        if 'surveillance' in tags:
            camera.surveillance = tags['surveillance']
        if 'camera:type' in tags:
            camera.camera_type = tags['camera:type']
        if 'surveillance:zone' in tags:
            camera.zone = tags['surveillance:zone']

        if 'height' in tags:
            try:
                camera.height = float(tags['height'])
            except Exception:
                self.stderr.write(f"Camera #{camera.id}. Field : height. Expected float, found {tags['height']}. Field kept empty.")

        camera.direction = self.compute_direction(tags, camera)
        
        if 'camera:angle' in tags:
            try:
                camera.angle = int(tags['camera:angle'])
            except Exception:
                self.stderr.write(f"Camera #{camera.id}. Field : Angle. Expected integer, found {tags['camera:angle']}. Field kept empty.")

        camera.save()

        if self.verbose:
            if created:
                self.stdout.write(f"Camera #{camera.id} created.")
            else:
                self.stdout.write(f"Camera #{camera.id} updated.")

        return camera

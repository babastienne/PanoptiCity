from django.contrib.gis.geos import Polygon
from rest_framework.exceptions import ParseError
from rest_framework_gis.filters import InBBoxFilter

from .tilenames import tile_edges

# We use a local implementation of the filter because of this bug : https://github.com/openwisp/django-rest-framework-gis/issues/328
# When this is fixed we can remove this file an tilenames.py file and change the viewset filter accordingly.
class TMSTileFilter(InBBoxFilter):
    tile_param = 'tile'  # The URL query parameter which contains the tile address

    def get_filter_bbox(self, request):
        tile_string = request.query_params.get(self.tile_param, None)
        if not tile_string:
            return None

        try:
            z, x, y = (int(n) for n in tile_string.split('/'))
        except ValueError:
            raise ParseError(
                f'Invalid tile string supplied for parameter {self.tile_param}'
            )

        bbox = Polygon.from_bbox(tile_edges(x, y, z))
        return bbox

    def get_schema_operation_parameters(self, view):
        return [
            {
                "name": self.tile_param,
                "required": False,
                "in": "query",
                "description": "Specify a bounding box filter defined by a TMS tile address: tile=Z/X/Y",
                "schema": {"type": "string", "example": "12/56/34"},
            },
        ]

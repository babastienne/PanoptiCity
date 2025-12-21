from cameras.constants import MAX_CLUSTER_ZOOM
from cameras.models import Camera
from cameras.serializers import (CameraClusterSerializer,
                                 CameraDetailSerializer, CameraListSerializer)
from django.contrib.gis.db.models import Collect
from django.contrib.gis.db.models.functions import Centroid, SnapToGrid
from django.db.models import Count, Min
from rest_framework import viewsets
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from rest_framework_gis.filters import InBBoxFilter, TMSTileFilter


# ViewSets define the view behavior.
class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraListSerializer
    bbox_filter_field = "location"
    filter_backends = (InBBoxFilter, TMSTileFilter)
    bbox_filter_include_overlapping = True

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CameraDetailSerializer

    def list(self, request, **kwargs):
        tile_string = request.query_params.get("tile", None)
        try:
            z = int(tile_string.split("/")[0])
        except ValueError as e:
            raise ParseError(
                "Invalid tile string supplied for parameter tile", e
            ) from e

        queryset = self.filter_queryset(self.get_queryset())

        # If no zoom is provided or zoom is high enough, use default serializer (CameraListSerializer)
        if z is None or int(z) >= MAX_CLUSTER_ZOOM:
            serializer = CameraListSerializer(
                queryset, many=True, context={'request': request, 'view': self} | kwargs)
            return Response(serializer.data)

        # Calculate grid size (approx 40px radius)
        # 360 degrees / (tile_size * 2^z)
        resolution = 360.0 / (256.0 * (2 ** int(z)))
        grid_size = resolution * 230

        clusters = (
            queryset
            .annotate(grid_point=SnapToGrid('location', grid_size))
            .values('grid_point')
            .annotate(
                count=Count('id'),
                true_center=Centroid(Collect('location')),
                point_id=Min('id'),
                point_marker=Min('marker'),
            )
            .order_by()
        )

        data = []
        for c in clusters:
            item = {
                "lat": round(c['true_center'].y, 6),
                "lon": round(c['true_center'].x, 6),
            }
            if c['count'] > 1:
                item["count"] = c['count']
            else:
                item["id"] = c['point_id']
                item["marker"] = c['point_marker']
            data.append(item)

        serializer = CameraClusterSerializer(data, many=True)
        return Response(serializer.data)

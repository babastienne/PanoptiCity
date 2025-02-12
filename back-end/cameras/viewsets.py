from rest_framework import viewsets
from rest_framework_gis.filters import InBBoxFilter, TMSTileFilter

from cameras.models import Camera
from cameras.serializers import CameraListSerializer, CameraDetailSerializer


# ViewSets define the view behavior.
class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraListSerializer
    detail_serializer_class = CameraDetailSerializer
    bbox_filter_field = "location"
    filter_backends = (InBBoxFilter, TMSTileFilter)
    bbox_filter_include_overlapping = True

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CameraDetailSerializer
        if self.action == "list":
            return CameraListSerializer

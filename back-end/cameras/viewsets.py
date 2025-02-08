from rest_framework import viewsets
from rest_framework_gis.filters import InBBoxFilter, TMSTileFilter

from cameras.models import Camera
from cameras.serializers import CameraSerializer

# ViewSets define the view behavior.
class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    bbox_filter_field = 'location'
    filter_backends = (InBBoxFilter, TMSTileFilter)
    bbox_filter_include_overlapping = True

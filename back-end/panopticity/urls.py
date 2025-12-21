from cameras.views import fov_tile_view
from cameras.viewsets import CameraViewSet
from django.urls import include, path
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"cameras", CameraViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path('api/focus/<int:z>/<int:x>/<int:y>/<str:scenario>/',
         fov_tile_view, name='fov-tiles'),
]

from django.urls import path, include
from rest_framework import routers

from cameras.viewsets import CameraViewSet

router = routers.DefaultRouter()
router.register(r"cameras", CameraViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
]

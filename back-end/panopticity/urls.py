from cameras.viewsets import CameraViewSet
from django.urls import include, path
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r"cameras", CameraViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
]

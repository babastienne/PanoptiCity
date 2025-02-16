# from django.conf import settings  # FIXME : Remove for production

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from cameras.viewsets import CameraViewSet

router = routers.DefaultRouter()
router.register(r"cameras", CameraViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]

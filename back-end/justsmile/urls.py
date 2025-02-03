# from django.conf import settings  # FIXME : Remove for production

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

# from debug_toolbar.toolbar import debug_toolbar_urls  # FIXME: Remove for production

from cameras.viewsets import CameraViewSet

router = routers.DefaultRouter()
router.register(r'cameras', CameraViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

# urlpatterns = urlpatterns + debug_toolbar_urls()  # FIXME : Remove for production

# if 'debug_toolbar' in settings.INSTALLED_APPS:  # FIXME : Remove for production
#     import debug_toolbar
#     urlpatterns += [
#         path('__debug__/', include(debug_toolbar.urls)),
#     ]

from rest_framework import serializers

from cameras.models import Camera


class CameraListSerializer(serializers.HyperlinkedModelSerializer):
    lat = serializers.SerializerMethodField()
    lon = serializers.SerializerMethodField()
    focus = serializers.SerializerMethodField()

    def get_lat(self, obj):
        return round(obj.location.y, 6)

    def get_lon(self, obj):
        return round(obj.location.x, 6)

    def get_focus(self, obj):
        focus = obj.focus
        return [[round(point[1], 6), round(point[0], 6)] for point in focus[0]] if focus else None

    class Meta:
        model = Camera
        fields = [
            'id',
            'lon',
            'lat',
            'mount',
            'surveillance_type',
            'surveillance',
            'camera_type',
            'zone',
            'height',
            'direction',
            'angle',
            'color',
            'marker',
            'focus'
        ]

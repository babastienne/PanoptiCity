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

    def __init__(self, *args, **kwargs):
        # Don't return focus and color when not explicitly asked with query_param 'focus'
        if 'focus' not in kwargs['context']['request'].query_params:
            del self.fields['focus']
            del self.fields['color']
        super().__init__(*args, **kwargs)

    class Meta:
        model = Camera
        fields = [
            'id',
            'lon',
            'lat',
            'color',
            'marker',
            'focus'
        ]

class CameraDetailSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Camera
        fields = [
            'id',
            'mount',
            'surveillance_type',
            'surveillance',
            'camera_type',
            'zone',
            'height',
            'direction',
            'angle',
        ]

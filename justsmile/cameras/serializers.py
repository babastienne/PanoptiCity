from rest_framework import serializers

from cameras.models import Camera


# Serializers define the API representation.
class CameraSerializer(serializers.HyperlinkedModelSerializer):
    lat = serializers.FloatField(source='location.x')
    lon = serializers.FloatField(source='location.y')


    focus = serializers.SerializerMethodField()
    # create_datetime = serializers.CharField(source='topo_object.date_insert')

    def get_focus(self, obj):
        return [point for point in obj.focus[0]] if obj.focus else None

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

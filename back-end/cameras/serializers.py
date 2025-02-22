from rest_framework import serializers

from cameras.models import Camera

MATCHING_LEVEL_COLORS = {
    'identification': 'purple',
    'recognition': 'red',
    'observation': 'green',
}

class CameraListSerializer(serializers.HyperlinkedModelSerializer):
    lat = serializers.SerializerMethodField()
    lon = serializers.SerializerMethodField()
    focus = serializers.SerializerMethodField()

    def get_lat(self, obj):
        return round(obj.location.y, 6)

    def get_lon(self, obj):
        return round(obj.location.x, 6)

    def get_focus(self, obj):
        list_focus = {}
        for elem in obj.camerafocus_set.all():
            if elem.scenario == 'best':
                list_focus[elem.level] = (
                        [[[[round(point[1], 6), round(point[0], 6)] for point in elem] for elem in poly] for poly in elem.geom]
                        if elem.geom
                        else None
                    )
        return list_focus

    def __init__(self, *args, **kwargs):
        # Don't return focus and color when not explicitly asked with query_param 'focus'
        if "focus" not in kwargs["context"]["request"].query_params:
            del self.fields["focus"]
            del self.fields["color"]
        super().__init__(*args, **kwargs)

    class Meta:
        model = Camera
        fields = ["id", "lon", "lat", "color", "marker", "focus"]


class CameraDetailSerializer(serializers.HyperlinkedModelSerializer):
    tags = serializers.SerializerMethodField()

    def get_tags(self, obj):
        return {tag.name: tag.value for tag in obj.cameratags_set.order_by('name')}

    class Meta:
        model = Camera
        fields = [
            "id",
            "tags",
            "mount",
            "surveillance_type",
            "surveillance",
            "camera_type",
            "zone",
            "height",
            "direction",
            "angle",
        ]

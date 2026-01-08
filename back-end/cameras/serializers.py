from cameras.models import Camera
from rest_framework import serializers


class CameraListSerializer(serializers.HyperlinkedModelSerializer):
    lat = serializers.SerializerMethodField()
    lon = serializers.SerializerMethodField()

    def get_lat(self, obj):
        return round(obj.location.y, 6)

    def get_lon(self, obj):
        return round(obj.location.x, 6)

    class Meta:
        model = Camera
        fields = ["id", "lon", "lat", "marker"]


class CameraDetailSerializer(serializers.HyperlinkedModelSerializer):
    tags = serializers.SerializerMethodField()
    fov = serializers.SerializerMethodField()

    def get_tags(self, obj):
        return {tag.name: tag.value for tag in obj.cameratags_set.order_by('name')}

    def get_fov(self, obj):
        list_focus = {'best': {}, 'mean': {}, 'worst': {}}
        for elem in obj.camerafocus_set.all():
            list_focus[elem.scenario][elem.level] = (
                [[[[round(point[1], 6), round(point[0], 6)] for point in elem]
                  for elem in poly] for poly in elem.geom]
                if elem.geom
                else None
            )
        return list_focus

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
            "fov",
            "marker",
        ]


class CameraClusterSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lon = serializers.FloatField()
    count = serializers.IntegerField(required=False)
    is_cluster = serializers.BooleanField(required=False)
    # FIXME: When https://github.com/encode/django-rest-framework/pull/9775/changes is release change to BigIntegerField
    id = serializers.IntegerField(required=False)
    marker = serializers.CharField(required=False)

from rest_framework import serializers

from locations.models import Region, Zone, SpecialWoreda, Woreda


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ZoneSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = Zone
        fields = ['id', 'name', 'region', 'region_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        # On update, DRF only includes changed fields in attrs by default
        # for PATCH — fall back to the existing instance for the
        # uniqueness check below when a field isn't part of this request.
        region = attrs.get('region', getattr(self.instance, 'region', None))
        name = attrs.get('name', getattr(self.instance, 'name', None))

        queryset = Zone.objects.filter(region=region, name__iexact=name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                {'name': "A Zone with this name already exists in the selected Region."}
            )

        return attrs


class SpecialWoredaSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)

    class Meta:
        model = SpecialWoreda
        fields = ['id', 'name', 'region', 'region_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        region = attrs.get('region', getattr(self.instance, 'region', None))
        name = attrs.get('name', getattr(self.instance, 'name', None))

        queryset = SpecialWoreda.objects.filter(region=region, name__iexact=name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                {'name': "A Special Woreda with this name already exists in the selected Region."}
            )

        return attrs


class WoredaSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    region_name = serializers.CharField(source='zone.region.name', read_only=True)

    class Meta:
        model = Woreda
        fields = ['id', 'name', 'zone', 'zone_name', 'region_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        zone = attrs.get('zone', getattr(self.instance, 'zone', None))
        name = attrs.get('name', getattr(self.instance, 'name', None))

        queryset = Woreda.objects.filter(zone=zone, name__iexact=name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                {'name': "A Woreda with this name already exists in the selected Zone."}
            )

        return attrs


# ---------------------------------------------------------------
# Nested read-only serializers, for efficiently building the
# frontend's cascading Region -> Zone/SpecialWoreda -> Woreda
# dropdowns in as few API calls as possible.
# ---------------------------------------------------------------

class WoredaNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Woreda
        fields = ['id', 'name']


class ZoneWithWoredasSerializer(serializers.ModelSerializer):
    woredas = WoredaNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Zone
        fields = ['id', 'name', 'woredas']


class SpecialWoredaNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialWoreda
        fields = ['id', 'name']


class RegionFullTreeSerializer(serializers.ModelSerializer):
    """
    Returns a Region with its full nested hierarchy (Zones with their
    Woredas, and Special Woredas) in a single response — intended for
    the registration form's cascading location selector, so the
    frontend can fetch the entire tree once rather than making a
    request at every dropdown level.
    """
    zones = ZoneWithWoredasSerializer(many=True, read_only=True)
    special_woredas = SpecialWoredaNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Region
        fields = ['id', 'name', 'zones', 'special_woredas']
from rest_framework import serializers

from locations.models import Region, Zone, SpecialWoreda, Woreda

from locations.models import Region, Zone, SpecialWoreda, Woreda, Kebele
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



class KebeleSerializer(serializers.ModelSerializer):
    woreda_name = serializers.SerializerMethodField()
    special_woreda_name = serializers.SerializerMethodField()

    def get_woreda_name(self, obj):
        return obj.woreda.name if obj.woreda else None

    def get_special_woreda_name(self, obj):
        return obj.special_woreda.name if obj.special_woreda else None
    
    class Meta:
        model = Kebele
        fields = ['id', 'name', 'woreda', 'woreda_name', 'special_woreda', 'special_woreda_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        woreda = attrs.get('woreda', getattr(self.instance, 'woreda', None))
        special_woreda = attrs.get('special_woreda', getattr(self.instance, 'special_woreda', None))
        name = attrs.get('name', getattr(self.instance, 'name', None))

        has_woreda = woreda is not None
        has_special = special_woreda is not None

        if has_woreda and has_special:
            raise serializers.ValidationError(
                "A Kebele must belong to either a Woreda or a Special Woreda — not both."
            )
        if not has_woreda and not has_special:
            raise serializers.ValidationError(
                "A Kebele must belong to either a Woreda or a Special Woreda."
            )

        if has_woreda:
            queryset = Kebele.objects.filter(woreda=woreda, name__iexact=name)
        else:
            queryset = Kebele.objects.filter(special_woreda=special_woreda, name__iexact=name)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            parent_label = "Woreda" if has_woreda else "Special Woreda"
            raise serializers.ValidationError(
                {'name': f"A Kebele with this name already exists in the selected {parent_label}."}
            )

        return attrs

# ---------------------------------------------------------------
# Nested read-only serializers, for efficiently building the
# frontend's cascading Region -> Zone/SpecialWoreda -> Woreda
# dropdowns in as few API calls as possible.
# ---------------------------------------------------------------

class KebeleNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kebele
        fields = ['id', 'name']


class WoredaNestedSerializer(serializers.ModelSerializer):
    kebeles = KebeleNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Woreda
        fields = ['id', 'name', 'kebeles']


class ZoneWithWoredasSerializer(serializers.ModelSerializer):
    woredas = WoredaNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Zone
        fields = ['id', 'name', 'woredas']


class SpecialWoredaNestedSerializer(serializers.ModelSerializer):
    kebeles = KebeleNestedSerializer(many=True, read_only=True)

    class Meta:
        model = SpecialWoreda
        fields = ['id', 'name', 'kebeles']


class RegionFullTreeSerializer(serializers.ModelSerializer):
    zones = ZoneWithWoredasSerializer(many=True, read_only=True)
    special_woredas = SpecialWoredaNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Region
        fields = ['id', 'name', 'zones', 'special_woredas']
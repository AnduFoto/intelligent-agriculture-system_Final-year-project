from rest_framework import serializers
from administration.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    region_name = serializers.CharField(source='region.name', read_only=True, default=None)
    zone_name = serializers.CharField(source='zone.name', read_only=True, default=None)
    woreda_name = serializers.CharField(source='woreda.name', read_only=True, default=None)
    special_woreda_name = serializers.CharField(source='special_woreda.name', read_only=True, default=None)
    kebele_name = serializers.CharField(source='kebele.name', read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'actor', 'actor_name', 'actor_email', 'category', 'category_display',
            'action', 'action_display', 'description', 'target_type', 'target_id',
            'target_repr', 'ip_address', 'metadata', 'is_success',
            'region', 'region_name', 'zone', 'zone_name',
            'woreda', 'woreda_name', 'special_woreda', 'special_woreda_name',
            'kebele', 'kebele_name', 'created_at'
        ]
        read_only_fields = fields

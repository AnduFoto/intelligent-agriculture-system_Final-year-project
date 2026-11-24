from rest_framework import serializers
from notifications.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 
            'title', 
            'message', 
            'category', 
            'notification_type', 
            'priority', 
            'is_read', 
            'read_at', 
            'created_at', 
            'action_url', 
            'related_object_type', 
            'related_object_id', 
            'metadata'
        ]
        read_only_fields = fields

class NotificationBatchActionSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        min_length=1
    )

from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from chat.models import (
    Conversation,
    ConversationParticipant,
    Message,
    BlockedUser,
    ChatReport
)


class UserMinimalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    location_summary = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'middle_name',
            'last_name',
            'full_name',
            'email',
            'role',
            'role_display',
            'status',
            'location_summary'
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_location_summary(self, obj):
        # Format location based on role & profile
        if hasattr(obj, 'assigned_kebeles') and obj.assigned_kebeles.exists():
            return f"Assigned: {', '.join([k.name for k in obj.assigned_kebeles.all()[:2]])}"
        if hasattr(obj, 'farmer_profile') and obj.farmer_profile.kebele:
            return f"Kebele: {obj.farmer_profile.kebele.name}"
        return "System Scope"


class MessageReplySerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender_name', 'message_type', 'text', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserMinimalSerializer(read_only=True)
    reply_to = MessageReplySerializer(read_only=True)
    is_read = serializers.SerializerMethodField()
    is_sender = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation_id',
            'sender',
            'is_sender',
            'message_type',
            'text',
            'media_file',
            'file_name',
            'file_size',
            'reply_to',
            'is_edited',
            'is_deleted',
            'created_at',
            'is_read',
            'reactions',
            'is_favorite'
        ]

    def get_is_sender(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.sender_id == request.user.id
        return False

    def get_is_read(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False

        # Get recipient participant
        conv = obj.conversation
        recipient = conv.get_other_user(obj.sender)
        if not recipient:
            return False

        recipient_part = conv.participants.filter(user=recipient).first()
        if recipient_part and recipient_part.last_read_at >= obj.created_at:
            return True
        return False

    def get_reactions(self, obj):
        request = self.context.get('request')
        current_user_id = request.user.id if request and request.user else None
        
        reaction_counts = {}
        user_emojis = set()
        
        for r in obj.reactions.all():
            emoji = r.emoji
            reaction_counts[emoji] = reaction_counts.get(emoji, 0) + 1
            if current_user_id and r.user_id == current_user_id:
                user_emojis.add(emoji)
                
        return [
            {
                'emoji': emoji,
                'count': count,
                'user_reacted': emoji in user_emojis
            }
            for emoji, count in reaction_counts.items()
        ]

    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        return obj.favorited_by.filter(user=request.user).exists()


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_typing = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'other_user',
            'last_message',
            'unread_count',
            'is_typing',
            'is_blocked',
            'updated_at',
            'created_at'
        ]

    def get_other_user(self, obj):
        request = self.context.get('request')
        if request and request.user:
            other = obj.get_other_user(request.user)
            if other:
                return UserMinimalSerializer(other, context=self.context).data
        return None

    def get_last_message(self, obj):
        last_msg = obj.messages.filter(is_deleted=False).order_by('-created_at').first()
        if not last_msg:
            return None

        data = MessageSerializer(last_msg, context=self.context).data

        # Check if there is a newer reaction in this conversation
        from chat.models import MessageReaction
        last_reaction = MessageReaction.objects.filter(
            message__conversation=obj
        ).order_by('-created_at').first()

        if last_reaction and last_reaction.created_at > last_msg.created_at:
            EMOJI_MAP = {
                'LIKE': '👍',
                'LOVE': '❤️',
                'LAUGH': '😂',
                'CRY': '😢',
                'CARE': '🥰',
                'SAD': '☹️'
            }
            symbol = EMOJI_MAP.get(last_reaction.emoji, last_reaction.emoji)
            data['text'] = f"Reacted {symbol} to a message"

        return data

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return 0
        part = obj.participants.filter(user=request.user).first()
        if not part:
            return 0

        unread_messages = obj.messages.filter(
            created_at__gt=part.last_read_at,
            is_deleted=False
        ).exclude(sender=request.user).count()

        from chat.models import MessageReaction
        unread_reactions = MessageReaction.objects.filter(
            message__conversation=obj,
            created_at__gt=part.last_read_at
        ).exclude(user=request.user).count()

        return unread_messages + unread_reactions

    def get_is_typing(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        other = obj.get_other_user(request.user)
        if not other:
            return False
        part = obj.participants.filter(user=other).first()
        if part and part.last_typed_at:
            # Active typing if within last 8 seconds
            return (timezone.now() - part.last_typed_at) <= timedelta(seconds=8)
        return False

    def get_is_blocked(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return False
        other = obj.get_other_user(request.user)
        if not other:
            return False
        from chat.models import BlockedUser
        return BlockedUser.objects.filter(
            blocker=request.user, blocked_user=other
        ).exists() or BlockedUser.objects.filter(
            blocker=other, blocked_user=request.user
        ).exists()


class BlockedUserSerializer(serializers.ModelSerializer):
    blocked_user = UserMinimalSerializer(read_only=True)

    class Meta:
        model = BlockedUser
        fields = ['id', 'blocked_user', 'created_at']


class ChatReportSerializer(serializers.ModelSerializer):
    reporter = UserMinimalSerializer(read_only=True)
    reported_user = UserMinimalSerializer(read_only=True)
    message = MessageSerializer(read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by = UserMinimalSerializer(read_only=True)

    class Meta:
        model = ChatReport
        fields = [
            'id',
            'reporter',
            'reported_user',
            'conversation_id',
            'message',
            'reason',
            'reason_display',
            'description',
            'status',
            'status_display',
            'admin_note',
            'reviewed_by',
            'reviewed_at',
            'created_at'
        ]

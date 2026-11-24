import os
from django.db import transaction
from django.utils import timezone
from django.db.models import F, Q, Count
from django.core.exceptions import ValidationError, PermissionDenied
from django.conf import settings

from accounts.models import User, StatusChoices
from chat.models import (
    Conversation,
    ConversationParticipant,
    Message,
    MessageTypeChoices,
    MessageReaction,
    FavoriteMessage,
    ReactionChoices,
    BlockedUser,
    ChatReport,
    ReportStatusChoices
)
from notifications.services import NotificationService
from administration.services import AuditService
from administration.models import ActionTypeChoices, ActionCategoryChoices

# File Size Limits in Bytes
MAX_IMAGE_SIZE = 10 * 1024 * 1024       # 10 MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024       # 50 MB
MAX_VOICE_SIZE = 20 * 1024 * 1024       # 20 MB
MAX_FILE_SIZE = 25 * 1024 * 1024        # 25 MB

ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov']
ALLOWED_VOICE_EXTS = ['.webm', '.wav', '.ogg', '.mp3', '.m4a']


class ChatService:

    @staticmethod
    def get_or_create_conversation(user_a, user_b):
        """
        Retrieves or creates a normalized one-to-one conversation between user_a and user_b.
        """
        if user_a.id == user_b.id:
            raise ValidationError("Cannot create a conversation with yourself.")

        user1, user2 = (user_a, user_b) if user_a.id < user_b.id else (user_b, user_a)

        with transaction.atomic():
            conversation, created = Conversation.objects.get_or_create(
                user1=user1,
                user2=user2
            )

            # Ensure both participants exist
            ConversationParticipant.objects.get_or_create(conversation=conversation, user=user1)
            ConversationParticipant.objects.get_or_create(conversation=conversation, user=user2)

        return conversation, created

    @staticmethod
    def send_message(
        sender,
        conversation_id,
        text='',
        message_type=MessageTypeChoices.TEXT,
        media_file=None,
        reply_to_id=None,
        file_name='',
        request=None
    ):
        """
        Sends a message in a conversation. Performs status, participant, block, and media validation.
        """
        if sender.status == StatusChoices.SUSPENDED or not sender.is_active:
            raise PermissionDenied("Your account is suspended. You cannot send messages.")

        try:
            conversation = Conversation.objects.select_related('user1', 'user2').get(pk=conversation_id)
        except Conversation.DoesNotExist:
            raise ValidationError("Conversation not found.")

        # Verify sender is participant
        if sender.id not in (conversation.user1_id, conversation.user2_id):
            raise PermissionDenied("You are not a participant in this conversation.")

        recipient = conversation.get_other_user(sender)

        # Check block relationships
        if BlockedUser.objects.filter(
            Q(blocker=sender, blocked_user=recipient) | Q(blocker=recipient, blocked_user=sender)
        ).exists():
            raise ValidationError("Messaging is disabled because a user block is active between participants.")

        # Media validation
        if media_file:
            ext = os.path.splitext(media_file.name)[1].lower()
            size = media_file.size

            if message_type == MessageTypeChoices.IMAGE:
                if ext not in ALLOWED_IMAGE_EXTS:
                    raise ValidationError(f"Invalid image extension ({ext}). Allowed: {', '.join(ALLOWED_IMAGE_EXTS)}")
                if size > MAX_IMAGE_SIZE:
                    raise ValidationError("Image file size exceeds the 10 MB limit.")
            elif message_type == MessageTypeChoices.VIDEO:
                if ext not in ALLOWED_VIDEO_EXTS:
                    raise ValidationError(f"Invalid video extension ({ext}). Allowed: {', '.join(ALLOWED_VIDEO_EXTS)}")
                if size > MAX_VIDEO_SIZE:
                    raise ValidationError("Video file size exceeds the 50 MB limit.")
            elif message_type == MessageTypeChoices.VOICE:
                if ext not in ALLOWED_VOICE_EXTS:
                    raise ValidationError(f"Invalid audio extension ({ext}). Allowed: {', '.join(ALLOWED_VOICE_EXTS)}")
                if size > MAX_VOICE_SIZE:
                    raise ValidationError("Voice file size exceeds the 20 MB limit.")
            else:
                if size > MAX_FILE_SIZE:
                    raise ValidationError("File size exceeds the 25 MB limit.")

        reply_to_msg = None
        if reply_to_id:
            reply_to_msg = Message.objects.filter(pk=reply_to_id, conversation=conversation).first()

        with transaction.atomic():
            message = Message.objects.create(
                conversation=conversation,
                sender=sender,
                message_type=message_type,
                text=text.strip(),
                media_file=media_file,
                file_name=file_name or (media_file.name if media_file else ''),
                file_size=media_file.size if media_file else None,
                reply_to=reply_to_msg
            )

            # Touch conversation timestamp
            conversation.updated_at = timezone.now()
            conversation.save(update_fields=['updated_at'])

            # Update sender's read timestamp
            sender_part = ConversationParticipant.objects.filter(conversation=conversation, user=sender).first()
            if sender_part:
                sender_part.last_read_at = timezone.now()
                sender_part.save(update_fields=['last_read_at'])

        return message

    @staticmethod
    def toggle_reaction(user, message_id, emoji):
        """
        Toggles an emoji reaction (LIKE, LOVE, LAUGH, CRY, CARE, SAD) on a message for user.
        """
        if emoji not in ReactionChoices.values:
            raise ValidationError(f"Invalid emoji '{emoji}'. Allowed: {', '.join(ReactionChoices.values)}")

        msg = Message.objects.filter(pk=message_id, is_deleted=False).first()
        if not msg:
            raise ValidationError("Message not found or deleted.")

        # Ensure user is participant of conversation
        conv = msg.conversation
        if user.id not in (conv.user1_id, conv.user2_id):
            raise PermissionDenied("You are not a participant in this conversation.")

        reaction = MessageReaction.objects.filter(message=msg, user=user, emoji=emoji).first()
        if reaction:
            reaction.delete()
            conv.updated_at = timezone.now()
            conv.save(update_fields=['updated_at'])
            return {'action': 'removed', 'emoji': emoji}
        else:
            MessageReaction.objects.create(message=msg, user=user, emoji=emoji)
            conv.updated_at = timezone.now()
            conv.save(update_fields=['updated_at'])
            return {'action': 'added', 'emoji': emoji}

    @staticmethod
    def toggle_favorite(user, message_id):
        """
        Toggles favorite status for a message for user.
        """
        msg = Message.objects.filter(pk=message_id, is_deleted=False).first()
        if not msg:
            raise ValidationError("Message not found or deleted.")

        conv = msg.conversation
        if user.id not in (conv.user1_id, conv.user2_id):
            raise PermissionDenied("You are not a participant in this conversation.")

        fav = FavoriteMessage.objects.filter(message=msg, user=user).first()
        if fav:
            fav.delete()
            return {'is_favorite': False}
        else:
            FavoriteMessage.objects.create(message=msg, user=user)
            return {'is_favorite': True}

    @staticmethod
    def mark_as_read(user, conversation_id):
        """
        Updates the participant's last_read_at timestamp.
        """
        part = ConversationParticipant.objects.filter(conversation_id=conversation_id, user=user).first()
        if part:
            part.last_read_at = timezone.now()
            part.save(update_fields=['last_read_at'])
            return True
        return False

    @staticmethod
    def update_typing_status(user, conversation_id):
        """
        Updates the participant's typing indicator timestamp.
        """
        part = ConversationParticipant.objects.filter(conversation_id=conversation_id, user=user).first()
        if part:
            part.last_typed_at = timezone.now()
            part.save(update_fields=['last_typed_at'])
            return True
        return False

    @staticmethod
    def get_unread_count(user):
        """
        Calculates total unread chat messages AND reactions for a user across all active conversations.
        """
        # Get all conversations user participates in
        participations = ConversationParticipant.objects.filter(user=user).select_related('conversation')
        total_unread = 0

        for part in participations:
            unread_in_conv = Message.objects.filter(
                conversation=part.conversation,
                created_at__gt=part.last_read_at,
                is_deleted=False
            ).exclude(sender=user).count()

            unread_reactions = MessageReaction.objects.filter(
                message__conversation=part.conversation,
                created_at__gt=part.last_read_at
            ).exclude(user=user).count()

            total_unread += (unread_in_conv + unread_reactions)

        return total_unread

    @staticmethod
    def edit_message(user, message_id, new_text):
        """
        Edits a text message sent by user.
        """
        msg = Message.objects.filter(pk=message_id, sender=user, is_deleted=False).first()
        if not msg:
            raise ValidationError("Message not found or cannot be edited.")
        if msg.message_type != MessageTypeChoices.TEXT:
            raise ValidationError("Only text messages can be edited.")

        msg.text = new_text.strip()
        msg.is_edited = True
        msg.save(update_fields=['text', 'is_edited', 'updated_at'])
        return msg

    @staticmethod
    def delete_message(user, message_id):
        """
        Soft-deletes a message sent by user.
        """
        msg = Message.objects.filter(pk=message_id, sender=user, is_deleted=False).first()
        if not msg:
            raise ValidationError("Message not found or already deleted.")

        msg.is_deleted = True
        msg.text = "This message was deleted."
        if msg.media_file:
            msg.media_file.delete(save=False)
            msg.media_file = None
        msg.save(update_fields=['is_deleted', 'text', 'media_file', 'updated_at'])
        return msg

    @staticmethod
    def block_user(blocker, blocked_user_id, request=None):
        """
        Blocks a user.
        """
        try:
            target = User.objects.get(pk=blocked_user_id)
        except User.DoesNotExist:
            raise ValidationError("Target user not found.")

        if blocker.id == target.id:
            raise ValidationError("You cannot block yourself.")

        blocked_obj, created = BlockedUser.objects.get_or_create(blocker=blocker, blocked_user=target)

        AuditService.log(
            action='USER_BLOCKED',
            description=f"User {blocker.get_full_name()} blocked {target.get_full_name()} ({target.email}).",
            actor=blocker,
            category=ActionCategoryChoices.USER,
            target_type='User',
            target_id=target.id,
            target_repr=target.get_full_name(),
            request=request
        )

        return blocked_obj

    @staticmethod
    def unblock_user(blocker, blocked_user_id, request=None):
        """
        Unblocks a user.
        """
        try:
            target = User.objects.get(pk=blocked_user_id)
        except User.DoesNotExist:
            raise ValidationError("Target user not found.")

        deleted, _ = BlockedUser.objects.filter(blocker=blocker, blocked_user=target).delete()

        AuditService.log(
            action='USER_UNBLOCKED',
            description=f"User {blocker.get_full_name()} unblocked {target.get_full_name()} ({target.email}).",
            actor=blocker,
            category=ActionCategoryChoices.USER,
            target_type='User',
            target_id=target.id,
            target_repr=target.get_full_name(),
            request=request
        )

        return True

    @staticmethod
    def report_chat(reporter, conversation_id, message_id=None, reason='OTHER', description='', request=None):
        """
        Submits a moderation report against a conversation/message.
        """
        try:
            conv = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            raise ValidationError("Conversation not found.")

        if reporter.id not in (conv.user1_id, conv.user2_id):
            raise PermissionDenied("You are not a participant in this conversation.")

        reported_user = conv.get_other_user(reporter)

        msg = None
        if message_id:
            msg = Message.objects.filter(pk=message_id, conversation=conv).first()

        report = ChatReport.objects.create(
            reporter=reporter,
            reported_user=reported_user,
            conversation=conv,
            message=msg,
            reason=reason,
            description=description.strip()
        )

        # Notify administrators
        admins = User.objects.filter(role='ADMINISTRATOR', status=StatusChoices.ACTIVE)
        NotificationService.notify_users(
            recipients=admins,
            title='New Chat Moderation Report',
            message=f"Report #{report.id} submitted by {reporter.get_full_name()} against {reported_user.get_full_name()}.",
            category='SYSTEM',
            action_url='/dashboard/admin/chat-reports'
        )

        AuditService.log(
            action='CHAT_REPORTED',
            description=f"User {reporter.get_full_name()} reported chat #{conv.id} with {reported_user.get_full_name()} (Reason: {reason}).",
            actor=reporter,
            category=ActionCategoryChoices.SYSTEM,
            target_type='ChatReport',
            target_id=report.id,
            target_repr=f"Report #{report.id}",
            request=request
        )

        return report

    @staticmethod
    def resolve_report(admin_user, report_id, status, admin_note='', action_taken=None, request=None):
        """
        Administrator processes a ChatReport: Dismisses, Warns, or Suspends the reported user.
        """
        try:
            report = ChatReport.objects.select_related('reporter', 'reported_user', 'conversation').get(pk=report_id)
        except ChatReport.DoesNotExist:
            raise ValidationError("Chat report not found.")

        report.status = status
        report.admin_note = admin_note
        report.reviewed_by = admin_user
        report.reviewed_at = timezone.now()
        report.save()

        reported_user = report.reported_user

        if action_taken == 'WARN':
            NotificationService.notify_user(
                recipient=reported_user,
                title='Account Policy Warning',
                message=f"Warning from Administrator: Your recent chat communication violated system guidelines. Reason: {admin_note or report.get_reason_display()}.",
                category='SYSTEM',
                notification_type='WARNING',
                priority='HIGH',
                action_url='/notifications'
            )
            AuditService.log(
                action=ActionTypeChoices.USER_UPDATED,
                description=f"Admin {admin_user.get_full_name()} issued warning to {reported_user.get_full_name()} for Report #{report.id}.",
                actor=admin_user,
                category=ActionCategoryChoices.USER,
                target_type='User',
                target_id=reported_user.id,
                target_repr=reported_user.get_full_name(),
                request=request
            )
        elif action_taken == 'SUSPEND':
            reported_user.status = StatusChoices.SUSPENDED
            reported_user.is_active = False
            reported_user.save(update_fields=['status', 'is_active'])

            NotificationService.notify_user(
                recipient=reported_user,
                title='Account Suspended',
                message=f"Your account has been suspended due to chat violations: {admin_note or report.get_reason_display()}.",
                category='SYSTEM'
            )
            AuditService.log(
                action=ActionTypeChoices.USER_SUSPENDED,
                description=f"Admin {admin_user.get_full_name()} suspended user {reported_user.get_full_name()} following Chat Report #{report.id}.",
                actor=admin_user,
                category=ActionCategoryChoices.USER,
                target_type='User',
                target_id=reported_user.id,
                target_repr=reported_user.get_full_name(),
                request=request
            )

        return report

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError


class MessageTypeChoices(models.TextChoices):
    TEXT = 'TEXT', 'Text'
    IMAGE = 'IMAGE', 'Image'
    VIDEO = 'VIDEO', 'Video'
    VOICE = 'VOICE', 'Voice'
    FILE = 'FILE', 'File'


class ReactionChoices(models.TextChoices):
    LIKE = 'LIKE', 'Like'
    LOVE = 'LOVE', 'Love'
    LAUGH = 'LAUGH', 'Laugh'
    CRY = 'CRY', 'Cry'
    CARE = 'CARE', 'Care'
    SAD = 'SAD', 'Sad'


class ReportReasonChoices(models.TextChoices):
    SPAM = 'SPAM', 'Spam'
    HARASSMENT = 'HARASSMENT', 'Harassment'
    INAPPROPRIATE = 'INAPPROPRIATE', 'Inappropriate Content'
    THREAT = 'THREAT', 'Threatening Behavior'
    IMPERSONATION = 'IMPERSONATION', 'Impersonation'
    OTHER = 'OTHER', 'Other'


class ReportStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    REVIEWING = 'REVIEWING', 'Reviewing'
    RESOLVED = 'RESOLVED', 'Resolved'
    DISMISSED = 'DISMISSED', 'Dismissed'


class Conversation(models.Model):
    """
    Represents a private one-to-one conversation between two users.
    Order of user1 and user2 is strictly normalized (user1_id < user2_id)
    to prevent duplicate one-to-one conversations between the same two users.
    """
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations_as_user1'
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations_as_user2'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user1', 'user2'],
                name='unique_conversation_user_pair'
            )
        ]

    def save(self, *args, **kwargs):
        # Normalize order so user1.id < user2.id always
        if self.user1_id and self.user2_id and self.user1_id > self.user2_id:
            self.user1, self.user2 = self.user2, self.user1
        super().save(*args, **kwargs)

    def clean(self):
        super().clean()
        if self.user1_id == self.user2_id:
            raise ValidationError("A user cannot create a conversation with themselves.")

    def get_other_user(self, user):
        if user.id == self.user1_id:
            return self.user2
        elif user.id == self.user2_id:
            return self.user1
        return None

    def get_participant(self, user):
        return self.participants.filter(user=user).first()

    def __str__(self):
        return f"Conversation #{self.id}: {self.user1.get_full_name()} & {self.user2.get_full_name()}"


class ConversationParticipant(models.Model):
    """
    Tracks per-user state for a conversation (last read timestamp, muted, archived, typing status).
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='participants'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_participations'
    )
    last_read_at = models.DateTimeField(default=timezone.now)
    last_typed_at = models.DateTimeField(null=True, blank=True)
    is_muted = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('conversation', 'user')
        indexes = [
            models.Index(fields=['user', 'conversation']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} in Conversation #{self.conversation_id}"


class Message(models.Model):
    """
    Represents an individual message (text, image, video, voice, or file) in a conversation.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        db_index=True
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_chat_messages',
        db_index=True
    )
    message_type = models.CharField(
        max_length=10,
        choices=MessageTypeChoices.choices,
        default=MessageTypeChoices.TEXT
    )
    text = models.TextField(blank=True)
    media_file = models.FileField(
        upload_to='chat/media/%Y/%m/',
        null=True,
        blank=True
    )
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)
    reply_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replies'
    )
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]

    def __str__(self):
        return f"Msg #{self.id} from {self.sender.get_full_name()} ({self.message_type})"


class MessageReaction(models.Model):
    """
    Represents an emoji reaction (LIKE, LOVE, LAUGH, CRY, CARE, SAD) added by a user to a message.
    """
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='reactions'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_reactions'
    )
    emoji = models.CharField(
        max_length=10,
        choices=ReactionChoices.choices
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['message', 'user', 'emoji'],
                name='unique_message_user_reaction'
            )
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} reacted {self.emoji} to Msg #{self.message_id}"


class FavoriteMessage(models.Model):
    """
    Tracks favorited/starred messages per user.
    """
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='favorited_by'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorite_messages'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['message', 'user'],
                name='unique_message_user_favorite'
            )
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} favorited Msg #{self.message_id}"



class BlockedUser(models.Model):
    """
    Prevents messages between blocker and blocked_user.
    """
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocking_users'
    )
    blocked_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocked_by_users'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['blocker', 'blocked_user'],
                name='unique_blocked_pair'
            )
        ]

    def clean(self):
        super().clean()
        if self.blocker_id == self.blocked_user_id:
            raise ValidationError("You cannot block yourself.")

    def __str__(self):
        return f"{self.blocker.get_full_name()} blocked {self.blocked_user.get_full_name()}"


class ChatReport(models.Model):
    """
    Allows users to report inappropriate messages or users for administrative moderation.
    """
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_chat_reports'
    )
    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_chat_reports'
    )
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    message = models.ForeignKey(
        Message,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports'
    )
    reason = models.CharField(
        max_length=20,
        choices=ReportReasonChoices.choices
    )
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=ReportStatusChoices.choices,
        default=ReportStatusChoices.PENDING,
        db_index=True
    )
    admin_note = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} by {self.reporter.get_full_name()} against {self.reported_user.get_full_name()}"

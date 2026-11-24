from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class PostTypeChoices(models.TextChoices):
    TEXT = 'TEXT', 'Text Only'
    IMAGE = 'IMAGE', 'Image'
    VIDEO = 'VIDEO', 'Video'
    MIXED = 'MIXED', 'Mixed Content'


class PostVisibilityChoices(models.TextChoices):
    PUBLIC = 'PUBLIC', 'Public'
    COMMUNITY = 'COMMUNITY', 'Community Only'


class MediaTypeChoices(models.TextChoices):
    IMAGE = 'IMAGE', 'Image'
    VIDEO = 'VIDEO', 'Video'


class ReportReasonChoices(models.TextChoices):
    SPAM = 'SPAM', 'Spam'
    HARASSMENT = 'HARASSMENT', 'Harassment'
    INAPPROPRIATE = 'INAPPROPRIATE', 'Inappropriate Content'
    MISINFORMATION = 'MISINFORMATION', 'Agricultural Misinformation'
    HATEFUL_CONTENT = 'HATEFUL_CONTENT', 'Hateful Content'
    SCAM = 'SCAM', 'Scam or Fraud'
    OTHER = 'OTHER', 'Other'


class ReportStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    REVIEWED = 'REVIEWED', 'Reviewed'
    DISMISSED = 'DISMISSED', 'Dismissed'
    ACTION_TAKEN = 'ACTION_TAKEN', 'Action Taken'


class Post(models.Model):
    """
    Community post for sharing agricultural experiences, questions, and insights.
    """
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='community_posts'
    )
    content = models.TextField()
    post_type = models.CharField(
        max_length=20,
        choices=PostTypeChoices.choices,
        default=PostTypeChoices.TEXT
    )
    visibility = models.CharField(
        max_length=20,
        choices=PostVisibilityChoices.choices,
        default=PostVisibilityChoices.PUBLIC
    )

    # Optional agricultural metadata
    crop_type = models.ForeignKey(
        'consultations.CropType',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_posts'
    )

    # Optional location context
    region = models.ForeignKey(
        'locations.Region',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_posts'
    )
    zone = models.ForeignKey(
        'locations.Zone',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_posts'
    )
    woreda = models.ForeignKey(
        'locations.Woreda',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_posts'
    )
    special_woreda = models.ForeignKey(
        'locations.SpecialWoreda',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_posts'
    )
    kebele = models.ForeignKey(
        'locations.Kebele',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_posts'
    )

    # Cached counts for high query performance
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    shares_count = models.PositiveIntegerField(default=0)

    # Status flags
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['author']),
            models.Index(fields=['crop_type']),
            models.Index(fields=['region']),
        ]

    def __str__(self):
        return f"Post #{self.pk} by {self.author.email}"

    def clean(self):
        super().clean()
        # Location XOR validation if location fields are specified
        if self.zone and self.special_woreda:
            raise ValidationError("A post cannot be tagged with both a Zone and a Special Woreda.")
        if self.woreda and self.special_woreda:
            raise ValidationError("A post cannot be tagged with both a Woreda and a Special Woreda.")


class PostMedia(models.Model):
    """
    Uploaded images or videos attached to a community post.
    """
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='media_files'
    )
    file = models.FileField(upload_to='community/posts/%Y/%m/')
    media_type = models.CharField(
        max_length=20,
        choices=MediaTypeChoices.choices,
        default=MediaTypeChoices.IMAGE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Media ({self.media_type}) for Post #{self.post_id}"


class PostLike(models.Model):
    """
    User like on a community post.
    """
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='post_likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['post', 'user'], name='unique_user_post_like')
        ]

    def __str__(self):
        return f"{self.user.email} liked Post #{self.post_id}"


class Comment(models.Model):
    """
    Comment or nested reply on a post.
    """
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='post_comments'
    )
    content = models.TextField()
    parent_comment = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    likes_count = models.PositiveIntegerField(default=0)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'created_at']),
        ]

    def __str__(self):
        return f"Comment #{self.pk} by {self.author.email} on Post #{self.post_id}"

    def clean(self):
        super().clean()
        if self.parent_comment and self.parent_comment.post_id != self.post_id:
            raise ValidationError("Parent comment must belong to the same post.")
        # Prevent self-nesting
        if self.parent_comment and self.parent_comment.pk == self.pk:
            raise ValidationError("A comment cannot be its own parent.")


class CommentLike(models.Model):
    """
    User like on a comment.
    """
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comment_likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['comment', 'user'], name='unique_user_comment_like')
        ]

    def __str__(self):
        return f"{self.user.email} liked Comment #{self.comment_id}"


class PostShare(models.Model):
    """
    Record of a user sharing an existing post with optional commentary.
    """
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='shares'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shared_posts'
    )
    optional_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} shared Post #{self.post_id}"


class PostReport(models.Model):
    """
    Report submitted by a user against a post or comment for moderation.
    """
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='community_reports_submitted'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports'
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reports'
    )
    reason = models.CharField(
        max_length=30,
        choices=ReportReasonChoices.choices,
        default=ReportReasonChoices.INAPPROPRIATE
    )
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=ReportStatusChoices.choices,
        default=ReportStatusChoices.PENDING
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community_reports_reviewed'
    )
    admin_note = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        target = f"Post #{self.post_id}" if self.post_id else f"Comment #{self.comment_id}"
        return f"Report #{self.pk} on {target} ({self.get_status_display()})"

    def clean(self):
        super().clean()
        if not self.post and not self.comment:
            raise ValidationError("Report must be associated with either a post or a comment.")
        if self.post and self.comment:
            raise ValidationError("Report cannot target both a post and a comment simultaneously.")

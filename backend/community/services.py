from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError, PermissionDenied
from community.models import (
    Post, PostMedia, PostLike, Comment, CommentLike, PostShare, PostReport,
    PostTypeChoices, PostVisibilityChoices, MediaTypeChoices, ReportStatusChoices
)
from notifications.services import NotificationService
from administration.services import AuditService


class CommunityService:
    """
    Centralized service layer for Community feed, posts, comments, likes, shares,
    reporting, and admin moderation.
    """

    @staticmethod
    @transaction.atomic
    def create_post(author, content, post_type=PostTypeChoices.TEXT, visibility=PostVisibilityChoices.PUBLIC,
                    crop_type_id=None, region_id=None, zone_id=None, woreda_id=None,
                    special_woreda_id=None, kebele_id=None, media_files=None):
        """
        Creates a new community post with optional crop and location tags, and handles media uploads.
        """
        # Default location to author's profile location if not explicitly provided
        if not (region_id or zone_id or woreda_id or special_woreda_id or kebele_id):
            region_id = getattr(author, 'region_id', None)
            special_woreda_id = getattr(author, 'special_woreda_id', None)
            if not special_woreda_id:
                zone_id = getattr(author, 'zone_id', None)
                woreda_id = getattr(author, 'woreda_id', None)
            kebele_id = getattr(author, 'kebele_id', None)

        post = Post.objects.create(
            author=author,
            content=content,
            post_type=post_type,
            visibility=visibility,
            crop_type_id=crop_type_id,
            region_id=region_id,
            zone_id=zone_id,
            woreda_id=woreda_id,
            special_woreda_id=special_woreda_id,
            kebele_id=kebele_id
        )

        if media_files:
            has_image = False
            has_video = False
            for media_item in media_files:
                file_obj = media_item.get('file')
                m_type = media_item.get('media_type', MediaTypeChoices.IMAGE)
                if file_obj:
                    PostMedia.objects.create(
                        post=post,
                        file=file_obj,
                        media_type=m_type
                    )
                    if m_type == MediaTypeChoices.IMAGE:
                        has_image = True
                    elif m_type == MediaTypeChoices.VIDEO:
                        has_video = True
            
            # Auto-infer post_type if not explicitly set to MIXED
            if has_image and has_video:
                post.post_type = PostTypeChoices.MIXED
            elif has_video:
                post.post_type = PostTypeChoices.VIDEO
            elif has_image:
                post.post_type = PostTypeChoices.IMAGE
            post.save(update_fields=['post_type'])

        return post

    @staticmethod
    def update_post(post, user, content=None, crop_type_id=None):
        """
        Updates post content or agricultural crop metadata.
        """
        if post.author_id != user.id and user.role != 'ADMINISTRATOR':
            raise PermissionDenied("You do not have permission to edit this post.")

        updated = False
        if content is not None and content != post.content:
            post.content = content
            updated = True
        if crop_type_id is not None and crop_type_id != post.crop_type_id:
            post.crop_type_id = crop_type_id
            updated = True

        if updated:
            post.is_edited = True
            post.save(update_fields=['content', 'crop_type_id', 'is_edited', 'updated_at'])

        return post

    @staticmethod
    @transaction.atomic
    def delete_post(post, user):
        """
        Soft deletes a community post.
        """
        if post.author_id != user.id and user.role != 'ADMINISTRATOR':
            raise PermissionDenied("You do not have permission to delete this post.")

        post.is_deleted = True
        post.deleted_at = timezone.now()
        post.save(update_fields=['is_deleted', 'deleted_at'])
        return post

    @staticmethod
    @transaction.atomic
    def toggle_like(post, user):
        """
        Toggles like on a post. Recalculates likes_count atomically.
        """
        existing_like = PostLike.objects.filter(post=post, user=user).first()
        if existing_like:
            existing_like.delete()
            post.likes_count = max(0, post.likes_count - 1)
            liked = False
        else:
            PostLike.objects.create(post=post, user=user)
            post.likes_count += 1
            liked = True

            # Send notification to post author (if user is not author)
            if post.author_id != user.id:
                NotificationService.notify_user(
                    recipient=post.author,
                    title="New Post Like",
                    message=f"{user.get_full_name()} liked your community post.",
                    category="COMMUNITY",
                    created_by=user,
                    action_url=f"/home?post={post.id}",
                    related_object_type="Post",
                    related_object_id=post.id
                )

        post.save(update_fields=['likes_count'])
        return liked, post.likes_count

    @staticmethod
    @transaction.atomic
    def create_comment(post, author, content, parent_comment_id=None):
        """
        Adds a comment or nested reply to a post.
        """
        parent_comment = None
        if parent_comment_id:
            try:
                parent_comment = Comment.objects.get(id=parent_comment_id, post=post, is_deleted=False)
            except Comment.DoesNotExist:
                raise ValidationError("Parent comment does not exist.")

        comment = Comment.objects.create(
            post=post,
            author=author,
            content=content,
            parent_comment=parent_comment
        )

        post.comments_count += 1
        post.save(update_fields=['comments_count'])

        # Send notification
        target_user = parent_comment.author if parent_comment else post.author
        if target_user.id != author.id:
            title = "New Reply to Your Comment" if parent_comment else "New Comment on Your Post"
            msg = f"{author.get_full_name()} replied to your comment." if parent_comment else f"{author.get_full_name()} commented on your post."
            NotificationService.notify_user(
                recipient=target_user,
                title=title,
                message=msg,
                category="COMMUNITY",
                created_by=author,
                action_url=f"/home?post={post.id}",
                related_object_type="Post",
                related_object_id=post.id
            )

        return comment

    @staticmethod
    def update_comment(comment, user, content):
        """
        Updates comment text.
        """
        if comment.author_id != user.id and user.role != 'ADMINISTRATOR':
            raise PermissionDenied("You do not have permission to edit this comment.")

        comment.content = content
        comment.is_edited = True
        comment.save(update_fields=['content', 'is_edited', 'updated_at'])
        return comment

    @staticmethod
    @transaction.atomic
    def delete_comment(comment, user):
        """
        Soft deletes a comment.
        """
        if comment.author_id != user.id and user.role != 'ADMINISTRATOR':
            raise PermissionDenied("You do not have permission to delete this comment.")

        comment.is_deleted = True
        comment.deleted_at = timezone.now()
        comment.save(update_fields=['is_deleted', 'deleted_at'])

        comment.post.comments_count = max(0, comment.post.comments_count - 1)
        comment.post.save(update_fields=['comments_count'])
        return comment

    @staticmethod
    @transaction.atomic
    def toggle_comment_like(comment, user):
        """
        Toggles like on a comment.
        """
        existing_like = CommentLike.objects.filter(comment=comment, user=user).first()
        if existing_like:
            existing_like.delete()
            comment.likes_count = max(0, comment.likes_count - 1)
            liked = False
        else:
            CommentLike.objects.create(comment=comment, user=user)
            comment.likes_count += 1
            liked = True

        comment.save(update_fields=['likes_count'])
        return liked, comment.likes_count

    @staticmethod
    @transaction.atomic
    def share_post(post, user, optional_text=""):
        """
        Shares an existing post.
        """
        share = PostShare.objects.create(
            post=post,
            user=user,
            optional_text=optional_text
        )

        post.shares_count += 1
        post.save(update_fields=['shares_count'])

        if post.author_id != user.id:
            NotificationService.notify_user(
                recipient=post.author,
                title="Post Shared",
                message=f"{user.get_full_name()} shared your post with the community.",
                category="COMMUNITY",
                created_by=user,
                action_url=f"/home?post={post.id}",
                related_object_type="Post",
                related_object_id=post.id
            )

        return share

    @staticmethod
    def report_post(reporter, post_id=None, comment_id=None, reason='INAPPROPRIATE', description=""):
        """
        Submits a report against a post or comment.
        """
        if not post_id and not comment_id:
            raise ValidationError("You must report either a post or a comment.")

        # Check duplicate pending reports by same user
        existing = PostReport.objects.filter(
            reporter=reporter,
            post_id=post_id,
            comment_id=comment_id,
            status=ReportStatusChoices.PENDING
        ).first()
        if existing:
            return existing

        report = PostReport.objects.create(
            reporter=reporter,
            post_id=post_id,
            comment_id=comment_id,
            reason=reason,
            description=description
        )
        return report

    @staticmethod
    @transaction.atomic
    def resolve_report(report, admin_user, status=ReportStatusChoices.ACTION_TAKEN, admin_note="", action_type="REMOVE"):
        """
        Moderates a reported post/comment.
        action_type can be: 'DISMISS', 'REMOVE', 'WARN', 'SUSPEND'.
        """
        if admin_user.role != 'ADMINISTRATOR':
            raise PermissionDenied("Only administrators can resolve community reports.")

        report.status = status
        report.reviewed_by = admin_user
        report.admin_note = admin_note
        report.reviewed_at = timezone.now()
        report.save()

        target_author = report.post.author if report.post else report.comment.author

        if action_type == 'REMOVE':
            if report.post:
                CommunityService.delete_post(report.post, admin_user)
            elif report.comment:
                CommunityService.delete_comment(report.comment, admin_user)

            NotificationService.notify_user(
                recipient=target_author,
                title="Community Content Removed",
                message=f"An administrator removed your content due to policy violation ({report.get_reason_display()}).",
                category="SYSTEM",
                notification_type="WARNING",
                priority="HIGH",
                created_by=admin_user,
                action_url="/notifications"
            )

        elif action_type == 'WARN':
            NotificationService.notify_user(
                recipient=target_author,
                title="Account Policy Warning",
                message=f"Warning from Administrator: Your community content received a report for {report.get_reason_display()}. Note: {admin_note}",
                category="SYSTEM",
                notification_type="WARNING",
                priority="HIGH",
                created_by=admin_user,
                action_url="/notifications"
            )

        elif action_type == 'SUSPEND':
            target_author.status = 'SUSPENDED'
            target_author.is_active = False
            target_author.save(update_fields=['status', 'is_active'])

            NotificationService.notify_user(
                recipient=target_author,
                title="Account Suspended",
                message=f"Your account has been suspended due to community violations. Contact support.",
                category="SYSTEM",
                notification_type="WARNING",
                priority="HIGH",
                created_by=admin_user,
                action_url="/notifications"
            )

        # Audit log
        AuditService.log(
            action=f"COMMUNITY_REPORT_{action_type}",
            description=f"Admin {admin_user.email} resolved report #{report.id} ({action_type}). Note: {admin_note}",
            actor=admin_user,
            target_type="PostReport",
            target_id=report.id,
            metadata={"reason": report.reason, "action_type": action_type}
        )

        return report

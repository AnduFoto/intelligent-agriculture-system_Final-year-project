from django.contrib.auth import get_user_model
from django.db import transaction
from notifications.models import Notification, NotificationTypeChoices, NotificationPriorityChoices

User = get_user_model()

class NotificationService:
    """
    Centralized service for creating in-app notifications.
    Abstracts away database creation logic and supports future channels.
    """

    @staticmethod
    def notify_user(
        recipient, 
        title, 
        message, 
        category,
        notification_type=NotificationTypeChoices.INFORMATION,
        priority=NotificationPriorityChoices.NORMAL,
        created_by=None,
        action_url=None,
        related_object_type=None,
        related_object_id=None,
        metadata=None
    ):
        """
        Send a notification to a specific user.
        """
        metadata = metadata or {}
        
        notification = Notification(
            recipient=recipient,
            title=title,
            message=message,
            category=category,
            notification_type=notification_type,
            priority=priority,
            created_by=created_by,
            action_url=action_url,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
            metadata=metadata
        )
        notification.save()
        return notification

    @staticmethod
    def notify_users(
        recipients, 
        title, 
        message, 
        category,
        notification_type=NotificationTypeChoices.INFORMATION,
        priority=NotificationPriorityChoices.NORMAL,
        **kwargs
    ):
        """
        Send a notification to a list/queryset of users by looping (if small).
        For large lists, notify_bulk should be preferred.
        """
        for recipient in recipients:
            NotificationService.notify_user(
                recipient=recipient,
                title=title,
                message=message,
                category=category,
                notification_type=notification_type,
                priority=priority,
                **kwargs
            )

    @staticmethod
    def notify_bulk(
        recipients, 
        title, 
        message, 
        category,
        notification_type=NotificationTypeChoices.INFORMATION,
        priority=NotificationPriorityChoices.NORMAL,
        created_by=None,
        action_url=None,
        related_object_type=None,
        related_object_id=None,
        metadata=None
    ):
        """
        Create notifications for multiple recipients in a single query.
        """
        metadata = metadata or {}
        
        notifications = [
            Notification(
                recipient=recipient,
                title=title,
                message=message,
                category=category,
                notification_type=notification_type,
                priority=priority,
                created_by=created_by,
                action_url=action_url,
                related_object_type=related_object_type,
                related_object_id=related_object_id,
                metadata=metadata
            )
            for recipient in recipients
        ]
        
        if notifications:
            Notification.objects.bulk_create(notifications, batch_size=500)
            
        return notifications

    @staticmethod
    def notify_role(
        role, 
        title, 
        message, 
        category,
        **kwargs
    ):
        """
        Send a notification to all active users with a specific role.
        """
        users = User.objects.filter(role=role, is_active=True, status='ACTIVE')
        NotificationService.notify_bulk(users, title, message, category, **kwargs)

    @staticmethod
    def notify_officer(recipient, title, message, category, **kwargs):
        if recipient.role == 'OFFICER':
            return NotificationService.notify_user(recipient, title, message, category, **kwargs)

    @staticmethod
    def notify_farmer(recipient, title, message, category, **kwargs):
        if recipient.role == 'FARMER':
            return NotificationService.notify_user(recipient, title, message, category, **kwargs)

    @staticmethod
    def notify_admin(title, message, category, **kwargs):
        users = User.objects.filter(role='ADMINISTRATOR', is_active=True, status='ACTIVE')
        NotificationService.notify_bulk(users, title, message, category, **kwargs)

    @staticmethod
    def notify_kebele(kebele_id, title, message, category, roles=None, **kwargs):
        """
        Notify users within a specific Kebele. Optionally filter by roles (e.g. ['FARMER']).
        """
        qs = User.objects.filter(kebele_id=kebele_id, is_active=True, status='ACTIVE')
        if roles:
            qs = qs.filter(role__in=roles)
        NotificationService.notify_bulk(qs, title, message, category, **kwargs)

    @staticmethod
    def notify_woreda(woreda_id, title, message, category, roles=None, **kwargs):
        """
        Notify users within a specific Woreda. Optionally filter by roles.
        """
        qs = User.objects.filter(woreda_id=woreda_id, is_active=True, status='ACTIVE')
        if roles:
            qs = qs.filter(role__in=roles)
        NotificationService.notify_bulk(qs, title, message, category, **kwargs)

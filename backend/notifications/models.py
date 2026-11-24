from django.db import models
from django.conf import settings

class NotificationCategoryChoices(models.TextChoices):
    AUTHENTICATION = 'AUTHENTICATION', 'Authentication'
    CONSULTATION = 'CONSULTATION', 'Consultation'
    AI_PREDICTION = 'AI_PREDICTION', 'AI Prediction'
    EDUCATION = 'EDUCATION', 'Education'
    ADMINISTRATION = 'ADMINISTRATION', 'Administration'
    ASSIGNMENT = 'ASSIGNMENT', 'Assignment'
    USER_MANAGEMENT = 'USER_MANAGEMENT', 'User Management'
    LOCATION = 'LOCATION', 'Location'
    SYSTEM = 'SYSTEM', 'System'

class NotificationTypeChoices(models.TextChoices):
    INFORMATION = 'INFORMATION', 'Information'
    SUCCESS = 'SUCCESS', 'Success'
    WARNING = 'WARNING', 'Warning'
    ERROR = 'ERROR', 'Error'
    SYSTEM = 'SYSTEM', 'System'

class NotificationPriorityChoices(models.TextChoices):
    LOW = 'LOW', 'Low'
    NORMAL = 'NORMAL', 'Normal'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical'

class NotificationRelatedObjectChoices(models.TextChoices):
    CONSULTATION = 'CONSULTATION', 'Consultation'
    CONSULTATION_MESSAGE = 'CONSULTATION_MESSAGE', 'Consultation Message'
    RESOURCE = 'RESOURCE', 'Educational Resource'
    PUBLISHER = 'PUBLISHER', 'Publisher'
    USER = 'USER', 'User'
    PREDICTION = 'PREDICTION', 'AI Prediction'
    LOCATION = 'LOCATION', 'Location'
    ASSIGNMENT = 'ASSIGNMENT', 'Assignment'
    SYSTEM = 'SYSTEM', 'System'


class ActiveNotificationManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    category = models.CharField(
        max_length=50,
        choices=NotificationCategoryChoices.choices,
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationTypeChoices.choices,
        default=NotificationTypeChoices.INFORMATION
    )
    priority = models.CharField(
        max_length=50,
        choices=NotificationPriorityChoices.choices,
        default=NotificationPriorityChoices.NORMAL
    )
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_notifications'
    )
    
    action_url = models.CharField(max_length=500, blank=True, null=True)
    
    related_object_type = models.CharField(
        max_length=100, 
        choices=NotificationRelatedObjectChoices.choices,
        blank=True, 
        null=True
    )
    related_object_id = models.CharField(max_length=255, blank=True, null=True)
    
    metadata = models.JSONField(default=dict, blank=True)
    
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Managers
    objects = models.Manager() # Default manager (all)
    active_objects = ActiveNotificationManager() # Custom manager (active only)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', 'created_at']),
            models.Index(fields=['recipient', 'deleted_at']),
        ]

    def __str__(self):
        return f"To: {self.recipient.email} | {self.title} [{self.category}]"

from django.db import models
from django.conf import settings


class ActionCategoryChoices(models.TextChoices):
    USER = 'USER', 'User Management'
    LOCATION = 'LOCATION', 'Location Management'
    ASSIGNMENT = 'ASSIGNMENT', 'Officer Assignment'
    EDUCATION = 'EDUCATION', 'Education Management'
    CONSULTATION = 'CONSULTATION', 'Consultation Management'
    SYSTEM = 'SYSTEM', 'System Administration'


class ActionTypeChoices(models.TextChoices):
    # User actions
    USER_CREATED = 'USER_CREATED', 'User Created'
    USER_UPDATED = 'USER_UPDATED', 'User Updated'
    USER_ACTIVATED = 'USER_ACTIVATED', 'User Activated'
    USER_DEACTIVATED = 'USER_DEACTIVATED', 'User Deactivated'
    USER_SUSPENDED = 'USER_SUSPENDED', 'User Suspended'

    # Assignment actions
    OFFICER_ASSIGNED = 'OFFICER_ASSIGNED', 'Officer Assigned to Kebele'
    OFFICER_UNASSIGNED = 'OFFICER_UNASSIGNED', 'Officer Unassigned from Kebele'
    LEAD_OFFICER_ASSIGNED = 'LEAD_OFFICER_ASSIGNED', 'Lead Officer Assigned'
    LEAD_OFFICER_REMOVED = 'LEAD_OFFICER_REMOVED', 'Lead Officer Removed'
    EDUCATIONAL_MANAGER_ASSIGNED = 'EDUCATIONAL_MANAGER_ASSIGNED', 'Educational Manager Assigned'
    EDUCATIONAL_MANAGER_REMOVED = 'EDUCATIONAL_MANAGER_REMOVED', 'Educational Manager Removed'

    # Location actions
    LOCATION_CREATED = 'LOCATION_CREATED', 'Location Created'
    LOCATION_UPDATED = 'LOCATION_UPDATED', 'Location Updated'
    LOCATION_DEACTIVATED = 'LOCATION_DEACTIVATED', 'Location Deactivated'
    LOCATION_DELETED = 'LOCATION_DELETED', 'Location Deleted'

    # Resource actions
    RESOURCE_PUBLISHED = 'RESOURCE_PUBLISHED', 'Educational Resource Published'
    RESOURCE_ARCHIVED = 'RESOURCE_ARCHIVED', 'Educational Resource Archived'
    RESOURCE_DELETED = 'RESOURCE_DELETED', 'Educational Resource Deleted'

    # Consultation actions
    CONSULTATION_REASSIGNED = 'CONSULTATION_REASSIGNED', 'Consultation Reassigned'
    CONSULTATION_STATUS_CHANGED = 'CONSULTATION_STATUS_CHANGED', 'Consultation Status Changed'

    # System actions
    SYSTEM_SETTING_CHANGED = 'SYSTEM_SETTING_CHANGED', 'System Setting Changed'


class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    actor_name = models.CharField(max_length=255, blank=True, null=True)
    actor_email = models.EmailField(blank=True, null=True)
    
    category = models.CharField(
        max_length=50,
        choices=ActionCategoryChoices.choices,
        default=ActionCategoryChoices.SYSTEM
    )
    action = models.CharField(
        max_length=100,
        choices=ActionTypeChoices.choices
    )
    description = models.TextField()
    
    target_type = models.CharField(max_length=100, blank=True, null=True)
    target_id = models.CharField(max_length=100, blank=True, null=True)
    target_repr = models.CharField(max_length=255, blank=True, null=True)
    
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    is_success = models.BooleanField(default=True)

    # Hierarchical Location bindings for precise filtering (respecting Special Woreda XOR)
    region = models.ForeignKey(
        'locations.Region',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    zone = models.ForeignKey(
        'locations.Zone',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    woreda = models.ForeignKey(
        'locations.Woreda',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    special_woreda = models.ForeignKey(
        'locations.SpecialWoreda',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    kebele = models.ForeignKey(
        'locations.Kebele',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        actor_str = self.actor_name or (self.actor.get_full_name() if self.actor else 'System')
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {actor_str} - {self.get_action_display()}"

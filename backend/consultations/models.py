from django.db import models

# Create your models here.
from django.conf import settings



class ProfessionalSpecialization(models.Model):
    """
    A Kebele-scoped professional category (e.g. "Plant Science & Crop
    Production Officers"). Created and managed by that Kebele's Lead
    Officer. Not shared across Kebeles — each Lead Officer builds their
    own list (Decision B5).
    """
    kebele = models.ForeignKey(
        'locations.Kebele',
        on_delete=models.CASCADE,
        related_name='professional_specializations',
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['kebele', 'name'],
                name='unique_specialization_name_per_kebele',
            )
        ]
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.kebele.name})"

    def clean(self):
        # Case-insensitive uniqueness within the same Kebele, matching the
        # location-naming validation pattern used project-wide (Section 19).
        from django.core.exceptions import ValidationError
        qs = ProfessionalSpecialization.objects.filter(
            kebele=self.kebele, name__iexact=self.name
        ).exclude(pk=self.pk)
        if qs.exists():
            raise ValidationError(
                {'name': 'A specialization with this name already exists in this Kebele.'}
            )


class OfficerSpecialization(models.Model):
    """
    M2M through-model: an Officer holds one or more ProfessionalSpecializations.
    An Officer may only be assigned a specialization that belongs to a Kebele
    they are themselves assigned to (validated at the serializer level).
    """
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='specializations',
    )
    specialization = models.ForeignKey(
        ProfessionalSpecialization,
        on_delete=models.CASCADE,
        related_name='officers',
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+',
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['officer', 'specialization'],
                name='unique_officer_specialization',
            )
        ]
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.officer.email} — {self.specialization.name}"


class CropType(models.Model):
    """
    A globally shared crop catalog entry (e.g. "Tef", "Coffee", "Tomato").
    Managed exclusively by Administrators (Decision B6) — Lead Officers
    never create crops, only map existing ones to their Kebele's
    specializations via the `specializations` M2M below.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    specializations = models.ManyToManyField(
        ProfessionalSpecialization,
        related_name='crop_types',
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def clean(self):
        # Case-insensitive uniqueness, matching the location-naming pattern (Section 19).
        from django.core.exceptions import ValidationError
        qs = CropType.objects.filter(name__iexact=self.name).exclude(pk=self.pk)
        if qs.exists():
            raise ValidationError({'name': 'A crop with this name already exists.'})



class ConsultationStatus(models.TextChoices):
    NEW = 'NEW', 'New'
    ASSIGNED = 'ASSIGNED', 'Assigned'
    WAITING_FOR_FARMER = 'WAITING_FOR_FARMER', 'Waiting for Farmer'
    WAITING_FOR_OFFICER = 'WAITING_FOR_OFFICER', 'Waiting for Officer'
    RESOLVED = 'RESOLVED', 'Resolved'
    CLOSED = 'CLOSED', 'Closed'


class Consultation(models.Model):
    """
    The core case record. `kebele` is a snapshot of the farmer's Kebele at
    creation time — deliberately never updated afterward, since routing
    correctness at the moment of submission matters more than reflecting a
    later profile change (Decision F).
    """
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='consultations',
    )
    crop_type = models.ForeignKey(
        CropType,
        on_delete=models.PROTECT,
        related_name='consultations',
    )
    kebele = models.ForeignKey(
        'locations.Kebele',
        on_delete=models.PROTECT,
        related_name='consultations',
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=25,
        choices=ConsultationStatus.choices,
        default=ConsultationStatus.NEW,
    )
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_consultations',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Consultation #{self.pk} — {self.crop_type.name} ({self.farmer.email})"


class ConsultationImage(models.Model):
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='consultations/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']


class ConsultationMessage(models.Model):
    """
    Farmer-officer visible thread. Both the farmer and whichever officer is
    (or was) assigned can post here. Reassignment does not hide prior
    messages (Decision E13 — full history carries over).
    """
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='+',
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class ConsultationNote(models.Model):
    """
    Internal-only note — never exposed on any Farmer-facing endpoint
    (Decision E12). Visible to Officer/Lead Officer/Administrator only,
    enforced at the view/serializer layer.
    """
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='notes',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='+',
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class ConsultationAssignmentLog(models.Model):
    """
    Every assignment or reassignment, including the very first automatic
    one (assigned_by=None). The source of truth for round-robin tie-break
    in routing, and the audit trail for reassignment history.
    """
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='assignment_logs',
    )
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+',
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']




class ConsultationAIResult(models.Model):
    """
    One row per "Check Disease by AI" click. Never overwritten — every run
    (even a re-run on the same image) creates a new row, so the full
    diagnostic history stays in the timeline (Decision D11). Completely
    separate from predictions.PredictionHistory — no shared table, no FK
    back to it (Decision D10), avoiding duplication of that model while
    keeping the consultation self-contained.
    """
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='ai_results',
    )
    triggered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='+',
    )
    image = models.ForeignKey(
        ConsultationImage,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ai_results',
    )
    disease_class = models.CharField(max_length=100, blank=True)
    display_name = models.CharField(max_length=150, blank=True)
    crop = models.CharField(max_length=100, blank=True)
    confidence = models.FloatField(null=True, blank=True)
    is_healthy = models.BooleanField(default=False)
    is_valid_crop_image = models.BooleanField(default=True)
    agent_message = models.TextField(blank=True)
    solution_detail = models.JSONField(null=True, blank=True)
    top_predictions = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Officer's decision about this specific AI run — visible only to the
    # officer until sent, per Business Rule "AI result is not automatically
    # sent to the farmer."
    sent_to_farmer = models.BooleanField(default=False)
    was_edited = models.BooleanField(default=False)
    sent_message = models.TextField(
        blank=True,
        help_text="The actual text sent to the farmer, if sent (may be edited from agent_message).",
    )
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"AI Result for Consultation #{self.consultation_id} ({self.created_at})"
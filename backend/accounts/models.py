from django.db import models

# Create your models here.
import uuid
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models

from accounts.managers import UserManager



class RoleChoices(models.TextChoices):
    FARMER = 'FARMER', 'Farmer'
    OFFICER = 'OFFICER', 'Agriculture Officer'
    ADMINISTRATOR = 'ADMINISTRATOR', 'Administrator'


class StatusChoices(models.TextChoices):
    PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Verification'
    ACTIVE = 'ACTIVE', 'Active'
    SUSPENDED = 'SUSPENDED', 'Suspended'


class LanguageChoices(models.TextChoices):
    ENGLISH = 'EN', 'English'
    AMHARIC = 'AM', 'Amharic'


phone_validator = RegexValidator(
    regex=r'^\+?[0-9]{9,15}$',
    message="Enter a valid phone number (9 to 15 digits, optional leading '+')."
)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for the Intelligent Agriculture System.
    Email is the unique identifier used for authentication (no username field).
    """

    # ---------- Identity ----------
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(
        max_length=20,
        validators=[phone_validator]
    )

    # ---------- Role & Status ----------
    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.FARMER
    )
    status = models.CharField(
        max_length=25,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING_VERIFICATION
    )

    # ---------- Preferences ----------
    language_preference = models.CharField(
        max_length=2,
        choices=LanguageChoices.choices,
        default=LanguageChoices.ENGLISH
    )
    
    profile_image = models.ImageField(
        upload_to='profiles/',
        null=True,
        blank=True
    )

    # ---------- Location (Zone+Woreda OR SpecialWoreda) ----------
    region = models.ForeignKey(
        'locations.Region',
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )
    zone = models.ForeignKey(
        'locations.Zone',
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )
    woreda = models.ForeignKey(
        'locations.Woreda',
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )
    special_woreda = models.ForeignKey(
        'locations.SpecialWoreda',
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )

    kebele = models.ForeignKey(
        'locations.Kebele',
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )

    # Only meaningful for OFFICER accounts. A Farmer or Administrator
    # will never have entries here — their single location chain
    # (region/zone/woreda/special_woreda/kebele above) is what applies
    # to them instead. Enforcement that only Officers may have
    # assignments here happens at the serializer/view level (Phase 2,
    # Decision 2), not via a database constraint.
    assigned_kebeles = models.ManyToManyField(
        'locations.Kebele',
        through='OfficerKebeleAssignment',
        through_fields=('officer', 'kebele'),
        related_name='assigned_officers',
        blank=True
    )

    # ---------- Django auth-required flags ----------
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # ---------- Timestamps ----------
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(p for p in parts if p)

    def get_short_name(self):
        return self.first_name

    def clean(self):
        """
        Enforce the location business rule:
        exactly (zone + woreda) OR (special_woreda) — never both, never neither.

        This full location chain (including kebele) applies to all roles,
        but OFFICER accounts are not required to provide a kebele.
        """
        super().clean()

        if not self.region_id:
            raise ValidationError("Region is required.")

        has_zone_path = bool(self.zone) and bool(self.woreda)
        has_partial_zone_path = bool(self.zone) != bool(self.woreda)
        has_special = bool(self.special_woreda)

        if has_partial_zone_path:
            raise ValidationError(
                "Both Zone and Woreda must be provided together."
            )

        if has_zone_path and has_special:
            raise ValidationError(
                "Select either a Zone with Woreda, or a Special Woreda — not both."
            )

        if not has_zone_path and not has_special:
            raise ValidationError(
                "You must select either a Zone with Woreda, or a Special Woreda."
            )

        # Cross-check consistency: woreda must actually belong to the selected zone
        if self.zone and self.woreda and self.woreda.zone_id != self.zone_id:
            raise ValidationError(
                "The selected Woreda does not belong to the selected Zone."
            )

        # Cross-check consistency: zone/special_woreda must belong to the selected region
        if self.zone and self.zone.region_id != self.region_id:
            raise ValidationError(
                "The selected Zone does not belong to the selected Region."
            )
        if self.special_woreda and self.special_woreda.region_id != self.region_id:
            raise ValidationError(
                "The selected Special Woreda does not belong to the selected Region."
            )

        # Kebele check: required for FARMER and ADMINISTRATOR, optional for OFFICER.
        if self.role != RoleChoices.OFFICER:
            if not self.kebele:
                raise ValidationError("Kebele is required.")

        if self.kebele:
            if self.woreda and self.kebele.woreda_id != self.woreda_id:
                raise ValidationError(
                    "The selected Kebele does not belong to the selected Woreda."
                )

            if self.special_woreda and self.kebele.special_woreda_id != self.special_woreda_id:
                raise ValidationError(
                    "The selected Kebele does not belong to the selected Special Woreda."
                )
        


class EmailVerificationToken(models.Model):
    """
    Single-use token proving a user controls the email address they registered with.
    Created at registration time; consumed once when the user clicks the verification link.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='email_verification_tokens'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Email Verification Token'
        verbose_name_plural = 'Email Verification Tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f"Verification token for {self.user.email} (used={self.used})"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Default validity window: 24 hours from creation.
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        return not self.used and not self.is_expired

    def mark_as_used(self):
        self.used = True
        self.used_at = timezone.now()
        self.save(update_fields=['used', 'used_at'])
class PasswordResetToken(models.Model):
    """
    Single-use token for the Forgot Password flow.
    Expires 30 minutes after creation, per project security requirements.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f"Password reset token for {self.user.email} (used={self.used})"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Fixed 30-minute validity window, per confirmed security requirement.
            self.expires_at = timezone.now() + timedelta(minutes=30)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        return not self.used and not self.is_expired

    def mark_as_used(self):
        self.used = True
        self.used_at = timezone.now()
        self.save(update_fields=['used', 'used_at'])


class OfficerKebeleAssignment(models.Model):
    """
    Through model for the assigned_kebeles M2M relationship. Recording
    WHEN each assignment was made and WHICH Administrator made it,
    since a Kebele can be assigned to multiple Officers simultaneously
    and each individual assignment needs its own history.
    """
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kebele_assignments'
    )
    kebele = models.ForeignKey(
        'locations.Kebele',
        on_delete=models.CASCADE,
        related_name='officer_assignments'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )

    class Meta:
        unique_together = ('officer', 'kebele')
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.officer.email} -> {self.kebele.name}"


class LeadOfficerAssignment(models.Model):
    """
    Designates a single Officer as the Lead Officer for a single Kebele.
    Business rule: one Kebele -> one Lead Officer, one Lead Officer -> one Kebele.
    The designated user must already hold role=OFFICER and must already have
    an existing OfficerKebeleAssignment to the same Kebele (enforced at the
    serializer level, mirroring the defense-in-depth pattern used elsewhere
    in this project).
    """
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lead_officer_assignment',
    )
    kebele = models.OneToOneField(
    'locations.Kebele',
    on_delete=models.CASCADE,
    related_name='lead_officer_assignment',
)
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+',
    )

    class Meta:
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.officer.email} — Lead Officer for {self.kebele.name}"
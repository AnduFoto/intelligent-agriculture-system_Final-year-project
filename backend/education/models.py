from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

class PublisherTypeChoices(models.TextChoices):
    WOREDA = 'WOREDA', 'Woreda Education'
    SPECIAL_WOREDA = 'SPECIAL_WOREDA', 'Special Woreda Education'
    KEBELE = 'KEBELE', 'Kebele Education'


class PublisherProfile(models.Model):
    """
    The official organizational body (Woreda Education or Kebele Education).
    Created automatically when a Woreda or Kebele is registered.
    """
    name = models.CharField(max_length=200)
    publisher_type = models.CharField(
        max_length=20,
        choices=PublisherTypeChoices.choices
    )
    woreda = models.OneToOneField(
        'locations.Woreda',
        on_delete=models.CASCADE,
        related_name='publisher_profile',
        null=True,
        blank=True
    )
    special_woreda = models.OneToOneField(
        'locations.SpecialWoreda',
        on_delete=models.CASCADE,
        related_name='publisher_profile',
        null=True,
        blank=True
    )
    kebele = models.OneToOneField(
        'locations.Kebele',
        on_delete=models.CASCADE,
        related_name='publisher_profile',
        null=True,
        blank=True
    )
    cover_image = models.ImageField(upload_to='education/publishers/covers/', null=True, blank=True)
    logo = models.ImageField(upload_to='education/publishers/logos/', null=True, blank=True)
    description = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    office_address = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['woreda'],
                name='unique_publisher_per_woreda',
                condition=models.Q(woreda__isnull=False)
            ),
            models.UniqueConstraint(
                fields=['special_woreda'],
                name='unique_publisher_per_special_woreda',
                condition=models.Q(special_woreda__isnull=False)
            ),
            models.UniqueConstraint(
                fields=['kebele'],
                name='unique_publisher_per_kebele',
                condition=models.Q(kebele__isnull=False)
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.get_publisher_type_display()})"

    def clean(self):
        super().clean()
        if self.publisher_type == PublisherTypeChoices.WOREDA:
            if not self.woreda:
                raise ValidationError("Woreda publisher must be linked to a Woreda.")
            if self.kebele or self.special_woreda:
                raise ValidationError("Woreda publisher cannot be linked to a Kebele or Special Woreda.")
        elif self.publisher_type == PublisherTypeChoices.SPECIAL_WOREDA:
            if not self.special_woreda:
                raise ValidationError("Special Woreda publisher must be linked to a Special Woreda.")
            if self.kebele or self.woreda:
                raise ValidationError("Special Woreda publisher cannot be linked to a Kebele or Woreda.")
        elif self.publisher_type == PublisherTypeChoices.KEBELE:
            if not self.kebele:
                raise ValidationError("Kebele publisher must be linked to a Kebele.")
            if self.woreda or self.special_woreda:
                raise ValidationError("Kebele publisher cannot be linked to a Woreda or Special Woreda.")

    def get_educational_team(self):
        """
        Dynamically returns the team of active educational managers and relevant officers.
        - WOREDA: Admins + Woreda Educational System Managers.
        - KEBELE: Lead Officer + Kebele Educational System Managers.
        Returns a list of dicts with user info and position.
        """
        from accounts.models import User, RoleChoices
        team = []
        
        if self.publisher_type == PublisherTypeChoices.WOREDA and self.woreda_id:
            # Admins
            admins = User.objects.filter(role=RoleChoices.ADMINISTRATOR, is_active=True)
            for admin in admins:
                team.append({
                    'id': admin.id,
                    'full_name': admin.get_full_name(),
                    'email': admin.email,
                    'position': 'System Administrator'
                })
            
            # Woreda Managers
            assignments = self.woreda.educational_managers.select_related('officer').filter(officer__is_active=True)
            for assignment in assignments:
                team.append({
                    'id': assignment.officer.id,
                    'full_name': assignment.officer.get_full_name(),
                    'email': assignment.officer.email,
                    'position': 'Woreda Educational System Manager'
                })
        elif self.publisher_type == PublisherTypeChoices.SPECIAL_WOREDA and self.special_woreda_id:
            # Admins (global)
            admins = User.objects.filter(role=RoleChoices.ADMINISTRATOR, is_active=True)
            for admin in admins:
                team.append({
                    'id': admin.id,
                    'full_name': admin.get_full_name(),
                    'email': admin.email,
                    'position': 'System Administrator'
                })
            
            # Special Woreda Managers
            assignments = self.special_woreda.educational_managers.select_related('officer').filter(officer__is_active=True)
            for assignment in assignments:
                team.append({
                    'id': assignment.officer.id,
                    'full_name': assignment.officer.get_full_name(),
                    'email': assignment.officer.email,
                    'position': 'Special Woreda Educational System Manager'
                })
        elif self.publisher_type == PublisherTypeChoices.KEBELE and self.kebele_id:
            # Lead Officer
            if hasattr(self.kebele, 'lead_officer_assignment') and self.kebele.lead_officer_assignment.officer.is_active:
                lead = self.kebele.lead_officer_assignment.officer
                team.append({
                    'id': lead.id,
                    'full_name': lead.get_full_name(),
                    'email': lead.email,
                    'position': 'Lead Officer'
                })
            
            # Kebele Managers
            assignments = self.kebele.educational_managers.select_related('officer').filter(officer__is_active=True)
            for assignment in assignments:
                team.append({
                    'id': assignment.officer.id,
                    'full_name': assignment.officer.get_full_name(),
                    'email': assignment.officer.email,
                    'position': 'Kebele Educational System Manager'
                })
                
        # deduplicate by ID in case someone holds multiple roles (e.g. Lead Officer + Kebele Manager)
        unique_team = {}
        for member in team:
            if member['id'] not in unique_team:
                unique_team[member['id']] = member
            else:
                # Combine positions
                if member['position'] not in unique_team[member['id']]['position']:
                    unique_team[member['id']]['position'] += f", {member['position']}"
                    
        return list(unique_team.values())


class WoredaEducationalManagerAssignment(models.Model):
    """
    Assigns an Officer to act as an Educational System Manager for a Woreda.
    Only Administrators can create this.
    """
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='woreda_education_assignments'
    )
    woreda = models.ForeignKey(
        'locations.Woreda',
        on_delete=models.CASCADE,
        related_name='educational_managers',
        null=True,
        blank=True
    )
    special_woreda = models.ForeignKey(
        'locations.SpecialWoreda',
        on_delete=models.CASCADE,
        related_name='educational_managers',
        null=True,
        blank=True
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-assigned_at']
        constraints = [
            models.UniqueConstraint(
                fields=['officer', 'woreda'],
                name='unique_manager_per_woreda',
                condition=models.Q(woreda__isnull=False)
            ),
            models.UniqueConstraint(
                fields=['officer', 'special_woreda'],
                name='unique_manager_per_special_woreda',
                condition=models.Q(special_woreda__isnull=False)
            )
        ]

    def clean(self):
        super().clean()
        if not self.woreda and not self.special_woreda:
            raise ValidationError("Must assign manager to a Woreda or a Special Woreda.")
        if self.woreda and self.special_woreda:
            raise ValidationError("Cannot assign manager to both a Woreda and a Special Woreda simultaneously.")

    def __str__(self):
        location_name = self.woreda.name if self.woreda else self.special_woreda.name
        return f"{self.officer.email} — Ed. Manager for {location_name}"


class KebeleEducationalManagerAssignment(models.Model):
    """
    Assigns an Officer to act as an Educational System Manager for a Kebele.
    Only Lead Officers of that Kebele (or Administrators) can create this.
    """
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kebele_education_assignments'
    )
    kebele = models.ForeignKey(
        'locations.Kebele',
        on_delete=models.CASCADE,
        related_name='educational_managers'
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('officer', 'kebele')
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.officer.email} — Ed. Manager for {self.kebele.name}"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Topic(models.Model):
    """
    Normalized tagging system (e.g. 'Tomato', 'Early Blight').
    Used for AI matching (e.g. AI predicts 'Tomato Early Blight', 
    we find resources with those topics).
    """
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ResourceStatusChoices(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PUBLISHED = 'PUBLISHED', 'Published'
    ARCHIVED = 'ARCHIVED', 'Archived'


class ResourceLanguageChoices(models.TextChoices):
    EN = 'EN', 'English'
    AM = 'AM', 'Amharic'


class Resource(models.Model):
    """
    The core educational resource.
    Belongs to a Publisher (Woreda/Kebele Education), authored by a user.
    """
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    short_summary = models.TextField()
    content = models.TextField()  # Rich text HTML
    
    publisher = models.ForeignKey(
        PublisherProfile,
        on_delete=models.PROTECT,
        related_name='resources'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='authored_resources'
    )
    
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='resources',
        null=True,
        blank=True
    )
    related_crops = models.ManyToManyField(
        'consultations.CropType',
        related_name='educational_resources',
        blank=True
    )
    topics = models.ManyToManyField(
        Topic,
        related_name='resources',
        blank=True
    )
    
    status = models.CharField(
        max_length=20,
        choices=ResourceStatusChoices.choices,
        default=ResourceStatusChoices.DRAFT
    )
    language = models.CharField(
        max_length=2,
        choices=ResourceLanguageChoices.choices,
        default=ResourceLanguageChoices.EN
    )
    
    cover_image = models.ImageField(upload_to='education/resources/covers/', null=True, blank=True)
    external_video_url = models.URLField(blank=True)
    uploaded_video = models.FileField(upload_to='education/resources/videos/', null=True, blank=True)
    
    is_featured = models.BooleanField(default=False)
    published_date = models.DateTimeField(null=True, blank=True)
    
    # Analytics Counters
    view_count = models.PositiveIntegerField(default=0)
    download_count = models.PositiveIntegerField(default=0)
    bookmark_count = models.PositiveIntegerField(default=0)
    
    # Maintenance / Review
    next_review_date = models.DateField(null=True, blank=True)
    last_reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+'
    )
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.publisher.name})"

    @property
    def review_status(self):
        if not self.next_review_date:
            return 'CURRENT'
        today = timezone.now().date()
        if today > self.next_review_date:
            return 'OVERDUE'
        if (self.next_review_date - today).days <= 30:
            return 'REVIEW_DUE'
        return 'CURRENT'


class ResourceAttachment(models.Model):
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    file = models.FileField(upload_to='education/resources/attachments/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return self.file_name


class ResourceImage(models.Model):
    """
    Gallery images embedded within the rich text content or displayed in a gallery.
    """
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='gallery_images'
    )
    image = models.ImageField(upload_to='education/resources/gallery/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['uploaded_at']


class Bookmark(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookmarked_resources'
    )
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'resource')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} bookmarked {self.resource.title}"


class RecentlyViewed(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recently_viewed_resources'
    )
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='recently_viewed_by'
    )
    viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'resource')
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.user.email} viewed {self.resource.title}"


class ConsultationAttachedResource(models.Model):
    """
    Extensibility model: Linking an educational resource to a consultation reply.
    """
    consultation = models.ForeignKey(
        'consultations.Consultation',
        on_delete=models.CASCADE,
        related_name='attached_resources'
    )
    message = models.ForeignKey(
        'consultations.ConsultationMessage',
        on_delete=models.CASCADE,
        related_name='attached_resources',
        null=True,
        blank=True
    )
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='attached_to_consultations'
    )
    attached_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='+'
    )
    attached_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-attached_at']

    def __str__(self):
        return f"Resource {self.resource_id} attached to Consultation {self.consultation_id}"

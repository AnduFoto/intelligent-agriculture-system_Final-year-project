from django.db import models

# Create your models here.
from django.db import models
from django.core.exceptions import ValidationError
from django.db import models

class Region(models.Model):
    """
    Top level of the administrative hierarchy.
    Managed exclusively by Administrators via CRUD endpoints.
    """
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Region'
        verbose_name_plural = 'Regions'

    def __str__(self):
        return self.name


class Zone(models.Model):
    """
    Second-level division. Belongs to a Region.
    A Zone CAN contain Woredas (unlike SpecialWoreda, which cannot).
    """
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE,
        related_name='zones'
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['region__name', 'name']
        verbose_name = 'Zone'
        verbose_name_plural = 'Zones'
        constraints = [
            models.UniqueConstraint(
                fields=['region', 'name'],
                name='unique_zone_name_per_region'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.region.name})"


class SpecialWoreda(models.Model):
    """
    Second-level division, alternative to Zone.
    Belongs directly to a Region and is terminal —
    it does NOT contain Woredas beneath it.
    """
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE,
        related_name='special_woredas'
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['region__name', 'name']
        verbose_name = 'Special Woreda'
        verbose_name_plural = 'Special Woredas'
        constraints = [
            models.UniqueConstraint(
                fields=['region', 'name'],
                name='unique_special_woreda_name_per_region'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.region.name}) [Special Woreda]"


class Woreda(models.Model):
    """
    Third-level division. Belongs only to a Zone
    (never directly to a Region, and never beneath a SpecialWoreda).
    """
    zone = models.ForeignKey(
        Zone,
        on_delete=models.CASCADE,
        related_name='woredas'
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['zone__name', 'name']
        verbose_name = 'Woreda'
        verbose_name_plural = 'Woredas'
        constraints = [
            models.UniqueConstraint(
                fields=['zone', 'name'],
                name='unique_woreda_name_per_zone'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.zone.name}, {self.zone.region.name})"



class Kebele(models.Model):
    """
    Fourth level of the administrative hierarchy. Belongs to exactly
    one of: a Woreda, or a Special Woreda — never both, never neither.
    Mirrors the same XOR-parent pattern already used one level up
    (Zone vs SpecialWoreda beneath Region).
    """
    woreda = models.ForeignKey(
        Woreda,
        on_delete=models.CASCADE,
        related_name='kebeles',
        null=True,
        blank=True
    )
    special_woreda = models.ForeignKey(
        SpecialWoreda,
        on_delete=models.CASCADE,
        related_name='kebeles',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Kebele'
        verbose_name_plural = 'Kebeles'
        constraints = [
            models.UniqueConstraint(
                fields=['woreda', 'name'],
                name='unique_kebele_name_per_woreda'
            ),
            models.UniqueConstraint(
                fields=['special_woreda', 'name'],
                name='unique_kebele_name_per_special_woreda'
            ),
        ]

    def __str__(self):
        parent = self.woreda if self.woreda else self.special_woreda
        return f"{self.name} ({parent})"

    def clean(self):
        super().clean()
        has_woreda = bool(self.woreda)
        has_special = bool(self.special_woreda)
        if has_woreda and has_special:
            raise ValidationError(
                "A Kebele must belong to either a Woreda or a Special Woreda — not both."
            )
        if not has_woreda and not has_special:
            raise ValidationError(
                "A Kebele must belong to either a Woreda or a Special Woreda."
            )
from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import ProfessionalSpecialization, OfficerSpecialization


@admin.register(ProfessionalSpecialization)
class ProfessionalSpecializationAdmin(admin.ModelAdmin):
    list_display = ('name', 'kebele', 'is_active', 'created_by', 'created_at')
    list_filter = ('kebele', 'is_active')
    search_fields = ('name', 'kebele__name')


@admin.register(OfficerSpecialization)
class OfficerSpecializationAdmin(admin.ModelAdmin):
    list_display = ('officer', 'specialization', 'assigned_by', 'assigned_at')
    list_filter = ('specialization__kebele',)
    search_fields = ('officer__email', 'specialization__name')


from .models import ProfessionalSpecialization, OfficerSpecialization, CropType


@admin.register(CropType)
class CropTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)
    filter_horizontal = ('specializations',)



from .models import (
    ProfessionalSpecialization,
    OfficerSpecialization,
    CropType,
    Consultation,
    ConsultationImage,
    ConsultationMessage,
    ConsultationNote,
    ConsultationAssignmentLog,
)


class ConsultationImageInline(admin.TabularInline):
    model = ConsultationImage
    extra = 0


class ConsultationMessageInline(admin.TabularInline):
    model = ConsultationMessage
    extra = 0


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('id', 'farmer', 'crop_type', 'kebele', 'status', 'assigned_officer', 'created_at')
    list_filter = ('status', 'kebele', 'crop_type')
    search_fields = ('farmer__email', 'title')
    inlines = [ConsultationImageInline, ConsultationMessageInline]


@admin.register(ConsultationAssignmentLog)
class ConsultationAssignmentLogAdmin(admin.ModelAdmin):
    list_display = ('consultation', 'assigned_officer', 'assigned_by', 'created_at')
    list_filter = ('assigned_officer',)


@admin.register(ConsultationNote)
class ConsultationNoteAdmin(admin.ModelAdmin):
    list_display = ('consultation', 'author', 'created_at')
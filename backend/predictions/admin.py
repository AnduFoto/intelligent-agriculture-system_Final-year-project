from django.contrib import admin

# Register your models here.
from django.contrib import admin

from predictions.models import PredictionHistory


@admin.register(PredictionHistory)
class PredictionHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'crop', 'confidence', 'is_healthy', 'created_at')
    list_filter = ('is_healthy', 'crop', 'created_at')
    search_fields = ('user__email', 'disease_class', 'display_name', 'crop')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
from django.contrib import admin

# Register your models here.
from django.contrib import admin
from locations.models import Region, Zone, SpecialWoreda, Woreda, Kebele


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'created_at')
    list_filter = ('region',)
    search_fields = ('name', 'region__name')


@admin.register(SpecialWoreda)
class SpecialWoredaAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'created_at')
    list_filter = ('region',)
    search_fields = ('name', 'region__name')


@admin.register(Woreda)
class WoredaAdmin(admin.ModelAdmin):
    list_display = ('name', 'zone', 'get_region', 'created_at')
    list_filter = ('zone__region', 'zone')
    search_fields = ('name', 'zone__name')

    def get_region(self, obj):
        return obj.zone.region
    get_region.short_description = 'Region'


    from locations.models import Region, Zone, SpecialWoreda, Woreda, Kebele


@admin.register(Kebele)
class KebeleAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_parent', 'created_at')
    search_fields = ('name', 'woreda__name', 'special_woreda__name')

    def get_parent(self, obj):
        return obj.woreda if obj.woreda else obj.special_woreda
    get_parent.short_description = 'Parent (Woreda / Special Woreda)'
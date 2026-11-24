import django_filters
from django.db.models import Q
from administration.models import AuditLog


class AuditLogFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category')
    action = django_filters.CharFilter(field_name='action')
    actor = django_filters.NumberFilter(field_name='actor__id')
    is_success = django_filters.BooleanFilter(field_name='is_success')

    # Hierarchical location filters (matches assigned location scope OR global logs)
    region = django_filters.NumberFilter(method='filter_region')
    zone = django_filters.NumberFilter(method='filter_zone')
    woreda = django_filters.NumberFilter(method='filter_woreda')
    special_woreda = django_filters.NumberFilter(method='filter_special_woreda')
    kebele = django_filters.NumberFilter(method='filter_kebele')

    # Date range filters (compare by date part to include full day records)
    start_date = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    end_date = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')

    # Generic search filter
    search = django_filters.CharFilter(method='filter_search')

    def filter_region(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(Q(region__id=value) | Q(region__isnull=True))

    def filter_zone(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(Q(zone__id=value) | Q(zone__isnull=True))

    def filter_woreda(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(Q(woreda__id=value) | Q(woreda__isnull=True))

    def filter_special_woreda(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(Q(special_woreda__id=value) | Q(special_woreda__isnull=True))

    def filter_kebele(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(Q(kebele__id=value) | Q(kebele__isnull=True))

    class Meta:
        model = AuditLog
        fields = [
            'category', 'action', 'actor', 'is_success',
            'region', 'zone', 'woreda', 'special_woreda', 'kebele',
            'start_date', 'end_date', 'search'
        ]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(actor_name__icontains=value) |
            Q(actor_email__icontains=value) |
            Q(description__icontains=value) |
            Q(target_repr__icontains=value) |
            Q(action__icontains=value)
        )

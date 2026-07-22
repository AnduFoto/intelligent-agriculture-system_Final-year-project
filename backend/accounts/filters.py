import django_filters

from accounts.models import User, RoleChoices, StatusChoices


class UserFilter(django_filters.FilterSet):
    role = django_filters.ChoiceFilter(choices=RoleChoices.choices)
    status = django_filters.ChoiceFilter(choices=StatusChoices.choices)
    region = django_filters.NumberFilter(field_name='region_id')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = User
        fields = ['role', 'status', 'region']

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(email__icontains=value)
            | Q(first_name__icontains=value)
            | Q(last_name__icontains=value)
            | Q(phone_number__icontains=value)
        )
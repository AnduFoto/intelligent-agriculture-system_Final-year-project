import django_filters
from community.models import Post


class PostFilter(django_filters.FilterSet):
    role = django_filters.CharFilter(field_name='author__role', lookup_expr='exact')
    crop = django_filters.NumberFilter(field_name='crop_type_id')
    region = django_filters.NumberFilter(field_name='region_id')
    zone = django_filters.NumberFilter(field_name='zone_id')
    woreda = django_filters.NumberFilter(field_name='woreda_id')
    special_woreda = django_filters.NumberFilter(field_name='special_woreda_id')
    kebele = django_filters.NumberFilter(field_name='kebele_id')
    search = django_filters.CharFilter(field_name='content', lookup_expr='icontains')

    class Meta:
        model = Post
        fields = ['role', 'crop', 'region', 'zone', 'woreda', 'special_woreda', 'kebele', 'search']

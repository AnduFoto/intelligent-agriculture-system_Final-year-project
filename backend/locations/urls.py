from django.urls import path

from locations.views import (
    RegionListCreateView,
    RegionDetailView,
    ZoneListCreateView,
    ZoneDetailView,
    SpecialWoredaListCreateView,
    SpecialWoredaDetailView,
    WoredaListCreateView,
    WoredaDetailView,
    KebeleListCreateView,
    KebeleDetailView,
    RegionFullTreeView,
)

app_name = 'locations'

urlpatterns = [
    # ---------- Full nested tree (public, for registration form) ----------
    path('tree/', RegionFullTreeView.as_view(), name='region-tree'),

    # ---------- Regions ----------
    path('regions/', RegionListCreateView.as_view(), name='region-list-create'),
    path('regions/<int:pk>/', RegionDetailView.as_view(), name='region-detail'),

    # ---------- Zones ----------
    path('zones/', ZoneListCreateView.as_view(), name='zone-list-create'),
    path('zones/<int:pk>/', ZoneDetailView.as_view(), name='zone-detail'),

    # ---------- Special Woredas ----------
    path('special-woredas/', SpecialWoredaListCreateView.as_view(), name='special-woreda-list-create'),
    path('special-woredas/<int:pk>/', SpecialWoredaDetailView.as_view(), name='special-woreda-detail'),

    # ---------- Woredas ----------
    path('woredas/', WoredaListCreateView.as_view(), name='woreda-list-create'),
    path('woredas/<int:pk>/', WoredaDetailView.as_view(), name='woreda-detail'),

    # ---------- Kebeles ----------
    path('kebeles/', KebeleListCreateView.as_view(), name='kebele-list-create'),
    path('kebeles/<int:pk>/', KebeleDetailView.as_view(), name='kebele-detail'),
]
from administration.services import AuditService
from administration.models import ActionTypeChoices
from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from locations.models import Region, Zone, SpecialWoreda, Woreda
from locations.models import Region, Zone, SpecialWoreda, Woreda, Kebele
from locations.serializers import (
    RegionSerializer,
    ZoneSerializer,
    SpecialWoredaSerializer,
    WoredaSerializer,
    KebeleSerializer,
    RegionFullTreeSerializer,
)
from accounts.permissions import IsAdministrator
from education.services import create_woreda_publisher_profile, create_kebele_publisher_profile, create_special_woreda_publisher_profile


class IsAdministratorOrReadOnly(IsAdministrator):
    """
    Extends IsAdministrator: any authenticated user may read (GET),
    but only Administrators may write (POST/PUT/PATCH/DELETE).

    Read access is intentionally open to ANY authenticated user (not
    just Administrators) because the public registration form's
    cascading location dropdowns, and any authenticated user's own
    profile-location editing, both need to read this data — only
    the CRUD/management actions are Administrator-only.
    """
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return bool(request.user and request.user.is_authenticated)
        return super().has_permission(request, view)


class RegionListCreateView(generics.ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAdministratorOrReadOnly]

    def perform_create(self, serializer):
        region = serializer.save()
        AuditService.log(
            action=ActionTypeChoices.LOCATION_CREATED,
            description=f"Created Region '{region.name}'",
            actor=self.request.user,
            target_type='Region',
            target_id=region.id,
            target_repr=region.name,
            request=self.request,
            region=region
        )


class RegionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAdministratorOrReadOnly]


class ZoneListCreateView(generics.ListCreateAPIView):
    queryset = Zone.objects.select_related('region').all()
    serializer_class = ZoneSerializer
    permission_classes = [IsAdministratorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['region']

    def perform_create(self, serializer):
        zone = serializer.save()
        AuditService.log(
            action=ActionTypeChoices.LOCATION_CREATED,
            description=f"Created Zone '{zone.name}' in Region '{zone.region.name}'",
            actor=self.request.user,
            target_type='Zone',
            target_id=zone.id,
            target_repr=zone.name,
            request=self.request,
            zone=zone,
            region=zone.region
        )


class ZoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Zone.objects.select_related('region').all()
    serializer_class = ZoneSerializer
    permission_classes = [IsAdministratorOrReadOnly]


class SpecialWoredaListCreateView(generics.ListCreateAPIView):
    queryset = SpecialWoreda.objects.select_related('region').all()
    serializer_class = SpecialWoredaSerializer
    permission_classes = [IsAdministratorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['region']

    def perform_create(self, serializer):
        special_woreda = serializer.save()
        create_special_woreda_publisher_profile(special_woreda)
        AuditService.log(
            action=ActionTypeChoices.LOCATION_CREATED,
            description=f"Created Special Woreda '{special_woreda.name}' in Region '{special_woreda.region.name}'",
            actor=self.request.user,
            target_type='SpecialWoreda',
            target_id=special_woreda.id,
            target_repr=special_woreda.name,
            request=self.request,
            special_woreda=special_woreda,
            region=special_woreda.region
        )


class SpecialWoredaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SpecialWoreda.objects.select_related('region').all()
    serializer_class = SpecialWoredaSerializer
    permission_classes = [IsAdministratorOrReadOnly]


class WoredaListCreateView(generics.ListCreateAPIView):
    queryset = Woreda.objects.select_related('zone', 'zone__region').all()
    serializer_class = WoredaSerializer
    permission_classes = [IsAdministratorOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['zone']

    def perform_create(self, serializer):
        woreda = serializer.save()
        create_woreda_publisher_profile(woreda)
        AuditService.log(
            action=ActionTypeChoices.LOCATION_CREATED,
            description=f"Created Woreda '{woreda.name}' in Zone '{woreda.zone.name}'",
            actor=self.request.user,
            target_type='Woreda',
            target_id=woreda.id,
            target_repr=woreda.name,
            request=self.request,
            woreda=woreda,
            zone=woreda.zone,
            region=woreda.zone.region if woreda.zone else None
        )


class WoredaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Woreda.objects.select_related('zone', 'zone__region').all()
    serializer_class = WoredaSerializer
    permission_classes = [IsAdministratorOrReadOnly]
from rest_framework.filters import SearchFilter


class KebeleListCreateView(generics.ListCreateAPIView):
    queryset = Kebele.objects.select_related('woreda', 'woreda__zone', 'woreda__zone__region', 'special_woreda', 'special_woreda__region').all()
    serializer_class = KebeleSerializer
    permission_classes = [IsAdministratorOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['woreda', 'special_woreda']
    search_fields = ['name']

    def perform_create(self, serializer):
        kebele = serializer.save()
        create_kebele_publisher_profile(kebele)
        parent_str = f"Special Woreda '{kebele.special_woreda.name}'" if kebele.special_woreda else f"Woreda '{kebele.woreda.name}'"
        AuditService.log(
            action=ActionTypeChoices.LOCATION_CREATED,
            description=f"Created Kebele '{kebele.name}' under {parent_str}",
            actor=self.request.user,
            target_type='Kebele',
            target_id=kebele.id,
            target_repr=kebele.name,
            request=self.request,
            kebele=kebele
        )


class KebeleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Kebele.objects.select_related('woreda', 'woreda__zone', 'woreda__zone__region', 'special_woreda', 'special_woreda__region').all()
    serializer_class = KebeleSerializer
    permission_classes = [IsAdministratorOrReadOnly]


class RegionFullTreeView(APIView):
    """
    Public-ish (any authenticated OR unauthenticated) endpoint returning
    every Region with its full nested Zone/Woreda/SpecialWoreda tree in
    one response — built specifically for the registration form's
    cascading location selector (Step 41), which needs this data
    BEFORE the user has an account or is logged in.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        regions = Region.objects.prefetch_related(
            'zones__woredas__kebeles', 'special_woredas__kebeles'
        ).all()
        serializer = RegionFullTreeSerializer(regions, many=True)
        return Response(serializer.data)
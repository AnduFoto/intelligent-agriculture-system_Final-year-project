from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from locations.models import Region, Zone, SpecialWoreda, Woreda
from locations.serializers import (
    RegionSerializer,
    ZoneSerializer,
    SpecialWoredaSerializer,
    WoredaSerializer,
    RegionFullTreeSerializer,
)
from accounts.permissions import IsAdministrator


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


class WoredaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Woreda.objects.select_related('zone', 'zone__region').all()
    serializer_class = WoredaSerializer
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
            'zones__woredas', 'special_woredas'
        ).all()
        serializer = RegionFullTreeSerializer(regions, many=True)
        return Response(serializer.data)
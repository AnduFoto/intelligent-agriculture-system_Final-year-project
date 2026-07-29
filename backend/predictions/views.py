from django.shortcuts import render

# Create your views here.
from django.core.files.base import ContentFile

from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response

import requests

from rest_framework.permissions import IsAuthenticated
from predictions.models import PredictionHistory
from predictions.serializers import (
    ImageUploadSerializer,
    PredictionHistorySerializer,
    PredictionHistoryListSerializer,
)
from predictions.services import call_ai_prediction_service, AIServiceError

from django.db.models import Count, Max
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from accounts.permissions import IsOfficerOrAdministrator
from predictions.scope import get_visible_kebele_ids
from predictions.serializers import KebeleBrowseSerializer
from locations.models import Kebele
from predictions.serializers import KebeleBrowseSerializer, CropBrowseSerializer
from django.db.models import Q
from accounts.models import User
from predictions.serializers import FarmerBrowseSerializer
from accounts.models import User, RoleChoices
class PredictDiseaseView(APIView):
    """
    Accepts a crop image from an authenticated Farmer, forwards it to
    the external AI Disease Detection System, and handles all three
    documented response shapes:

      Case A — AI System unreachable/timeout -> 503
      Case B — rejection (not a plant / not confident) -> 200,
               nothing saved
      Case C — genuine prediction -> 201, saved to our own
               PredictionHistory, our own image copy stored
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        upload_serializer = ImageUploadSerializer(data=request.data)
        upload_serializer.is_valid(raise_exception=True)
        image_file = upload_serializer.validated_data['image']

        try:
            ai_response = call_ai_prediction_service(image_file)
        except AIServiceError as exc:
            return Response(
                {
                    'success': False,
                    'detail': str(exc),
                    'errors': None,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Case B: the AI System's own rejection responses always
        # include is_valid_crop_image: false. Pass the message
        # straight through; nothing is persisted.
        if ai_response.get('is_valid_crop_image') is False:
            return Response(
                {
                    'is_valid_crop_image': False,
                    'agent_message': ai_response.get('agent_message', ''),
                },
                status=status.HTTP_200_OK,
            )

        # Case C: a genuine prediction. Re-save our own copy of the
        # image (Phase 2, Decision 1) rather than referencing the AI
        # System's own media URL, so our history stays fully
        # self-contained even if the AI System later moves/goes down.
        image_file.seek(0)  # the file was already read once by requests
                             # in call_ai_prediction_service; rewind before
                             # reading it again to save our own copy.
        image_content = ContentFile(image_file.read(), name=image_file.name)

        record = PredictionHistory.objects.create(
            user=request.user,
            image=image_content,
            disease_class=ai_response.get('disease', ''),
            display_name=ai_response.get('display_name', ''),
            crop=ai_response.get('crop', ''),
            confidence=ai_response.get('confidence', 0),
            is_healthy=ai_response.get('is_healthy', False),
            solution_detail=ai_response.get('solution_detail', {}),
            top_predictions=ai_response.get('top_predictions', []),
        )

        serializer = PredictionHistorySerializer(record, context={'request': request})
        response_data = dict(serializer.data)
        response_data['is_valid_crop_image'] = True
        response_data['agent_message'] = ai_response.get('agent_message', '')

        return Response(response_data, status=status.HTTP_201_CREATED)


class PredictionHistoryListView(generics.ListAPIView):
  
    
    """
    Lists the authenticated Farmer's own prediction history, newest
    first (per the model's default ordering).
    """
    serializer_class = PredictionHistoryListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user)


class PredictionHistoryDetailView(generics.RetrieveAPIView):

    """
    Retrieves a single prediction record's full detail. A Farmer can
    only retrieve their OWN records — enforced by scoping the
    queryset to request.user rather than a separate permission
    class, since there is no cross-user access scenario to handle
    here at all (unlike accounts.User, which Administrators can
    view others' records of).
    """
    serializer_class = PredictionHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PredictionHistory.objects.filter(user=self.request.user)




class KebeleBrowseListView(APIView):
    """
    Lists the Kebeles visible to the authenticated Officer or
    Administrator (per get_visible_kebele_ids), each annotated with
    a prediction count and most recent prediction date within it.

    Administrators see every Kebele in their own Woreda/Special
    Woreda, even ones with zero predictions ever made — this is a
    deliberate, confirmed design choice (a complete administrative
    view, not an "activity" view). Officers see only their assigned
    Kebeles, under the same rule.
    """
    permission_classes = [IsOfficerOrAdministrator]

    def get(self, request, *args, **kwargs):
        visible_kebele_ids = get_visible_kebele_ids(request.user)

        kebeles = Kebele.objects.filter(id__in=visible_kebele_ids).select_related(
            'woreda', 'special_woreda'
        ).annotate(
            prediction_count=Count(
                'users__prediction_history',
                distinct=True,
            ),
            last_prediction_at=Max('users__prediction_history__created_at'),
        )

        search = request.query_params.get('search')
        if search:
            kebeles = kebeles.filter(name__icontains=search)

        ordering = request.query_params.get('ordering', 'name')
        allowed_ordering = {'name', '-name', 'last_prediction_at', '-last_prediction_at', 'prediction_count', '-prediction_count'}
        if ordering not in allowed_ordering:
            ordering = 'name'
        kebeles = kebeles.order_by(ordering)

        data = [
            {
                'id': k.id,
                'name': k.name,
                'woreda_name': k.woreda.name if k.woreda else None,
                'special_woreda_name': k.special_woreda.name if k.special_woreda else None,
                'prediction_count': k.prediction_count,
                'last_prediction_at': k.last_prediction_at,
            }
            for k in kebeles
        ]

        serializer = KebeleBrowseSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CropBrowseListView(APIView):
    """
    Lists the distinct crop types that have been predicted by Farmers
    within a specific Kebele — only reachable if that Kebele falls
    within the caller's current scope (re-validated here, not just
    hidden client-side at the previous drill-down level).
    """
    permission_classes = [IsOfficerOrAdministrator]

    def get(self, request, kebele_id, *args, **kwargs):
        visible_kebele_ids = get_visible_kebele_ids(request.user)

        if not visible_kebele_ids.filter(id=kebele_id).exists():
            return Response(
                {'detail': "Kebele not found or not within your visibility scope."},
                status=status.HTTP_404_NOT_FOUND,
            )

        crops = PredictionHistory.objects.filter(
            user__kebele_id=kebele_id
        ).values('crop').annotate(
            prediction_count=Count('id'),
            last_prediction_at=Max('created_at'),
        ).order_by('crop')

        serializer = CropBrowseSerializer(crops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class FarmerBrowseListView(APIView):
    """
    Lists Farmers within a specific Kebele who have at least one
    prediction for a specific crop — the third level of the
    drill-down. Scope re-validated exactly as in CropBrowseListView.
    """
    permission_classes = [IsOfficerOrAdministrator]

    def get(self, request, kebele_id, crop, *args, **kwargs):
        visible_kebele_ids = get_visible_kebele_ids(request.user)

        if not visible_kebele_ids.filter(id=kebele_id).exists():
            return Response(
                {'detail': "Kebele not found or not within your visibility scope."},
                status=status.HTTP_404_NOT_FOUND,
            )

        farmers = User.objects.filter(
            kebele_id=kebele_id,
            role=RoleChoices.FARMER,
            prediction_history__crop=crop,
        ).annotate(
            prediction_count=Count('prediction_history', filter=Q(prediction_history__crop=crop)),
            last_prediction_at=Max('prediction_history__created_at', filter=Q(prediction_history__crop=crop)),
        ).distinct()

        data = [
            {
                'id': f.id,
                'full_name': f.get_full_name(),
                'email': f.email,
                'prediction_count': f.prediction_count,
                'last_prediction_at': f.last_prediction_at,
            }
            for f in farmers
        ]

        serializer = FarmerBrowseSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FarmerHistoryBrowseView(APIView):
    """
    Returns a specific Farmer's prediction history, optionally
    filtered by crop (?crop=<name>) — the final level of the
    drill-down. Access is re-validated against the Farmer's CURRENT
    kebele, not any cached/prior value, consistent with every other
    scope check in this feature.
    """
    permission_classes = [IsOfficerOrAdministrator]

    def get(self, request, farmer_id, *args, **kwargs):
        try:
            farmer = User.objects.get(pk=farmer_id, role=RoleChoices.FARMER)
        except User.DoesNotExist:
            return Response({'detail': "Farmer not found."}, status=status.HTTP_404_NOT_FOUND)

        visible_kebele_ids = get_visible_kebele_ids(request.user)
        if not farmer.kebele_id or not visible_kebele_ids.filter(id=farmer.kebele_id).exists():
            return Response(
                {'detail': "Farmer not found or not within your visibility scope."},
                status=status.HTTP_404_NOT_FOUND,
            )

        history = PredictionHistory.objects.filter(user=farmer)

        crop = request.query_params.get('crop')
        if crop:
            history = history.filter(crop=crop)

        history = history.order_by('-created_at')

        serializer = PredictionHistorySerializer(history, many=True, context={'request': request})
        return Response(
            {
                'farmer': {
                    'id': farmer.id,
                    'full_name': farmer.get_full_name(),
                    'email': farmer.email,
                },
                'predictions': serializer.data,
            },
            status=status.HTTP_200_OK,
        )
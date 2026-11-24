from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import ProfessionalSpecialization, OfficerSpecialization, CropType
from locations.models import Kebele
from accounts.models import User, OfficerKebeleAssignment
from accounts.permissions import IsAdministrator
from .models import ProfessionalSpecialization, OfficerSpecialization
from .permissions import IsLeadOfficerOfKebele
from .serializers import ProfessionalSpecializationSerializer, OfficerSpecializationSerializer
from .models import ProfessionalSpecialization, OfficerSpecialization, CropType
from .serializers import (
    ProfessionalSpecializationSerializer,
    OfficerSpecializationSerializer,
    CropTypeSerializer,
    CropTypeMappingSerializer,
    CropTypeWithKebeleMappingSerializer,
    ConsultationAIResultSerializer,
    ConsultationAICheckSerializer,
    ConsultationAISendSerializer,
)
from .permissions import (
    IsLeadOfficerOfKebele,
    IsAdministratorReadOnlyOrWrite,
    IsLeadOfficerOfKebeleOrAdministrator,
)


from .models import (
    Consultation,
    ConsultationMessage,
    ConsultationStatus,
    ConsultationImage,
    ConsultationAIResult,
)
from .permissions import IsLeadOfficerOfKebele, IsAdministratorReadOnlyOrWrite
from accounts.models import LeadOfficerAssignment, RoleChoices

class KebeleSpecializationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/consultations/kebeles/<kebele_id>/specializations/
         — Lead Officer of this Kebele, OR any Administrator (read access
           needed for crop-mapping configuration)
    POST /api/consultations/kebeles/<kebele_id>/specializations/
         — Lead Officer of this Kebele only (creation stays restricted)
    """
    serializer_class = ProfessionalSpecializationSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLeadOfficerOfKebele()]
        return [IsLeadOfficerOfKebeleOrAdministrator()]

    def get_kebele(self):
        return get_object_or_404(Kebele, pk=self.kwargs['kebele_id'])

    def get_queryset(self):
        return ProfessionalSpecialization.objects.filter(kebele_id=self.kwargs['kebele_id'])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['kebele'] = self.get_kebele()
        return context

class KebeleSpecializationDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/consultations/kebeles/<kebele_id>/specializations/<pk>/
    PATCH /api/consultations/kebeles/<kebele_id>/specializations/<pk>/
    Edit or activate/deactivate (via is_active). No DELETE — specializations
    are deactivated, not removed, to preserve integrity of existing
    Officer/CropType relationships (matching the project's no-hard-delete
    philosophy seen elsewhere, e.g. no DEACTIVATED-vs-delete ambiguity in
    the User model, Business Rule 10/29).
    """
    serializer_class = ProfessionalSpecializationSerializer
    permission_classes = [IsLeadOfficerOfKebele]

    def get_queryset(self):
        return ProfessionalSpecialization.objects.filter(kebele_id=self.kwargs['kebele_id'])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['kebele'] = get_object_or_404(Kebele, pk=self.kwargs['kebele_id'])
        return context


class KebeleEligibleOfficersView(APIView):
    """
    GET /api/consultations/kebeles/<kebele_id>/eligible-officers/
    Lists Officers assigned to this Kebele (i.e. eligible to receive a
    specialization here) along with their currently-held specializations
    in this Kebele. Lead-Officer-only.
    """
    permission_classes = [IsLeadOfficerOfKebele]

    def get(self, request, kebele_id):
        assignments = OfficerKebeleAssignment.objects.filter(kebele_id=kebele_id).select_related('officer')
        data = []
        for a in assignments:
            specs = OfficerSpecialization.objects.filter(
                officer=a.officer, specialization__kebele_id=kebele_id
            ).select_related('specialization')
            data.append({
                'officer_id': a.officer.id,
                'officer_email': a.officer.email,
                'officer_full_name': f"{a.officer.first_name} {a.officer.last_name}".strip(),
                'specializations': [
                    {'id': s.specialization.id, 'name': s.specialization.name} for s in specs
                ],
            })
        return Response(data)


class OfficerSpecializationAssignView(generics.CreateAPIView):
    """
    POST /api/consultations/kebeles/<kebele_id>/officer-specializations/
    Body: {officer_id, specialization_id}
    Lead-Officer-only. Assigns one specialization to one officer.
    """
    serializer_class = OfficerSpecializationSerializer
    permission_classes = [IsLeadOfficerOfKebele]

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)


class OfficerSpecializationRemoveView(APIView):
    """
    DELETE /api/consultations/kebeles/<kebele_id>/officer-specializations/<pk>/
    Lead-Officer-only.
    """
    permission_classes = [IsLeadOfficerOfKebele]

    def delete(self, request, kebele_id, pk):
        obj = get_object_or_404(
            OfficerSpecialization, pk=pk, specialization__kebele_id=kebele_id
        )
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CropTypeListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/consultations/crop-types/         — any authenticated user
    POST /api/consultations/crop-types/         — Administrator only
    """
    queryset = CropType.objects.all()
    serializer_class = CropTypeSerializer
    permission_classes = [IsAdministratorReadOnlyOrWrite]


class CropTypeDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/consultations/crop-types/<pk>/    — any authenticated user
    PATCH /api/consultations/crop-types/<pk>/    — Administrator only (edit / activate-deactivate)
    """
    queryset = CropType.objects.all()
    serializer_class = CropTypeSerializer
    permission_classes = [IsAdministratorReadOnlyOrWrite]


class KebeleCropMappingListView(generics.ListAPIView):
    """
    GET /api/consultations/kebeles/<kebele_id>/crop-mappings/
    Administrator-only. Lists every active global crop, annotated with
    whichever of this Kebele's specializations it's currently mapped to.
    """
    serializer_class = CropTypeWithKebeleMappingSerializer
    permission_classes = [IsAdministrator]

    def get_queryset(self):
        return CropType.objects.filter(is_active=True)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['kebele'] = get_object_or_404(Kebele, pk=self.kwargs['kebele_id'])
        return context


class KebeleCropMappingView(APIView):
    """
    POST   /api/consultations/kebeles/<kebele_id>/crop-mappings/<crop_id>/
    DELETE /api/consultations/kebeles/<kebele_id>/crop-mappings/<crop_id>/?specialization_id=<id>
    Administrator-only.
    """
    permission_classes = [IsAdministrator]

    def post(self, request, kebele_id, crop_id):
        kebele = get_object_or_404(Kebele, pk=kebele_id)
        crop = get_object_or_404(CropType, pk=crop_id, is_active=True)
        serializer = CropTypeMappingSerializer(data=request.data, context={'kebele': kebele})
        serializer.is_valid(raise_exception=True)
        specialization = serializer.validated_data['specialization_id']
        crop.specializations.add(specialization)
        return Response(
            CropTypeWithKebeleMappingSerializer(crop, context={'kebele': kebele}).data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, kebele_id, crop_id):
        kebele = get_object_or_404(Kebele, pk=kebele_id)
        crop = get_object_or_404(CropType, pk=crop_id)
        specialization_id = request.query_params.get('specialization_id')
        if not specialization_id:
            return Response(
                {'success': False, 'detail': 'specialization_id query parameter is required.', 'errors': None},
                status=status.HTTP_400_BAD_REQUEST,
            )
        specialization = get_object_or_404(
            ProfessionalSpecialization, pk=specialization_id, kebele=kebele
        )
        crop.specializations.remove(specialization)
        return Response(
            CropTypeWithKebeleMappingSerializer(crop, context={'kebele': kebele}).data,
            status=status.HTTP_200_OK,
        )

class KebeleCropMappingView(APIView):
    """
    POST   /api/consultations/kebeles/<kebele_id>/crop-mappings/<crop_id>/   — map a specialization to this crop
    DELETE /api/consultations/kebeles/<kebele_id>/crop-mappings/<crop_id>/?specialization_id=<id>  — unmap
    Administrator-only, per updated decision: Lead Officers manage
    specializations and officer assignments only; Administrators own both
    crop registration and crop-to-specialization mapping.
    """
    permission_classes = [IsAdministrator]

    def post(self, request, kebele_id, crop_id):
        kebele = get_object_or_404(Kebele, pk=kebele_id)
        crop = get_object_or_404(CropType, pk=crop_id, is_active=True)
        serializer = CropTypeMappingSerializer(data=request.data, context={'kebele': kebele})
        serializer.is_valid(raise_exception=True)
        specialization = serializer.validated_data['specialization_id']
        crop.specializations.add(specialization)
        return Response(
            CropTypeWithKebeleMappingSerializer(crop, context={'kebele': kebele}).data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, kebele_id, crop_id):
        kebele = get_object_or_404(Kebele, pk=kebele_id)
        crop = get_object_or_404(CropType, pk=crop_id)
        specialization_id = request.query_params.get('specialization_id')
        if not specialization_id:
            return Response(
                {'success': False, 'detail': 'specialization_id query parameter is required.', 'errors': None},
                status=status.HTTP_400_BAD_REQUEST,
            )
        specialization = get_object_or_404(
            ProfessionalSpecialization, pk=specialization_id, kebele=kebele
        )
        crop.specializations.remove(specialization)
        return Response(
            CropTypeWithKebeleMappingSerializer(crop, context={'kebele': kebele}).data,
            status=status.HTTP_200_OK,
        )


    from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from accounts.models import RoleChoices
from .models import Consultation, ConsultationMessage, ConsultationStatus
from .permissions import IsConsultationParticipant
from .serializers import (
    ConsultationCreateSerializer,
    ConsultationListSerializer,
    ConsultationDetailSerializer,
    ConsultationMessageCreateSerializer,
    ConsultationMessageSerializer,
)
from .services import create_consultation, RoutingError


class ConsultationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != RoleChoices.FARMER:
            return Response(
                {'success': False, 'detail': 'Only Farmers can create consultations.', 'errors': None},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ConsultationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            consultation = create_consultation(
                farmer=request.user,
                crop_type=serializer.validated_data['crop_type_id'],
                title=serializer.validated_data['title'],
                description=serializer.validated_data['description'],
                images=serializer.validated_data.get('images', []),
            )
        except RoutingError as e:
            return Response(
                {'success': False, 'detail': str(e), 'errors': None},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            ConsultationDetailSerializer(consultation).data,
            status=status.HTTP_201_CREATED,
        )


class MyConsultationListView(generics.ListAPIView):
    serializer_class = ConsultationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == RoleChoices.FARMER:
            return Consultation.objects.filter(farmer=user)
        if user.role == RoleChoices.OFFICER:
            return Consultation.objects.filter(assigned_officer=user)
        return Consultation.objects.none()


class ConsultationDetailView(generics.RetrieveAPIView):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = get_object_or_404(Consultation, pk=self.kwargs['pk'])
        checker = IsConsultationParticipant()
        if not checker.has_object_permission(self.request, self, obj):
            from django.http import Http404
            raise Http404
        return obj


class ConsultationMessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk)
        checker = IsConsultationParticipant()
        if not checker.has_object_permission(request, self, consultation):
            from django.http import Http404
            raise Http404

        if consultation.status == ConsultationStatus.CLOSED:
            return Response(
                {'success': False, 'detail': 'This consultation is closed.', 'errors': None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConsultationMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = ConsultationMessage.objects.create(
            consultation=consultation,
            sender=request.user,
            message=serializer.validated_data['message'],
        )

        from notifications.services import NotificationService
        from notifications.models import NotificationCategoryChoices, NotificationTypeChoices, NotificationRelatedObjectChoices

        if request.user.id == consultation.farmer_id:
            consultation.status = ConsultationStatus.WAITING_FOR_OFFICER
            NotificationService.notify_user(
                recipient=consultation.assigned_officer,
                title=f"New Message: {consultation.title}",
                message=f"{request.user.first_name} sent a new message.",
                category=NotificationCategoryChoices.CONSULTATION,
                notification_type=NotificationTypeChoices.INFORMATION,
                action_url=f"/officer/consultations/{consultation.id}",
                related_object_type=NotificationRelatedObjectChoices.CONSULTATION_MESSAGE,
                related_object_id=str(message.id)
            )
        else:
            consultation.status = ConsultationStatus.WAITING_FOR_FARMER
            NotificationService.notify_user(
                recipient=consultation.farmer,
                title=f"New Message: {consultation.title}",
                message=f"An officer replied to your consultation.",
                category=NotificationCategoryChoices.CONSULTATION,
                notification_type=NotificationTypeChoices.INFORMATION,
                action_url=f"/farmer/consultations/{consultation.id}",
                related_object_type=NotificationRelatedObjectChoices.CONSULTATION_MESSAGE,
                related_object_id=str(message.id)
            )
            
        consultation.save(update_fields=['status', 'updated_at'])

        return Response(
            ConsultationMessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )


class ConsultationCloseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk, farmer=request.user)
        if consultation.status == ConsultationStatus.CLOSED:
            return Response(
                {'success': False, 'detail': 'This consultation is already closed.', 'errors': None},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from django.utils import timezone
        consultation.status = ConsultationStatus.CLOSED
        consultation.closed_at = timezone.now()
        consultation.save(update_fields=['status', 'closed_at', 'updated_at'])

        if consultation.assigned_officer:
            from notifications.services import NotificationService
            from notifications.models import NotificationCategoryChoices, NotificationTypeChoices, NotificationRelatedObjectChoices

            NotificationService.notify_user(
                recipient=consultation.assigned_officer,
                title=f"Consultation Closed: {consultation.title}",
                message=f"The farmer has closed this consultation.",
                category=NotificationCategoryChoices.CONSULTATION,
                notification_type=NotificationTypeChoices.INFORMATION,
                action_url=f"/officer/consultations/{consultation.id}",
                related_object_type=NotificationRelatedObjectChoices.CONSULTATION,
                related_object_id=str(consultation.id)
            )

        return Response(ConsultationDetailSerializer(consultation).data)


class ConsultationResolveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk, assigned_officer=request.user)
        if consultation.status == ConsultationStatus.CLOSED:
            return Response(
                {'success': False, 'detail': 'This consultation is closed.', 'errors': None},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from django.utils import timezone
        consultation.status = ConsultationStatus.RESOLVED
        consultation.resolved_at = timezone.now()
        consultation.save(update_fields=['status', 'resolved_at', 'updated_at'])

        from notifications.services import NotificationService
        from notifications.models import NotificationCategoryChoices, NotificationTypeChoices, NotificationRelatedObjectChoices

        NotificationService.notify_user(
            recipient=consultation.farmer,
            title=f"Consultation Resolved: {consultation.title}",
            message=f"The officer has marked your consultation as resolved.",
            category=NotificationCategoryChoices.CONSULTATION,
            notification_type=NotificationTypeChoices.SUCCESS,
            action_url=f"/farmer/consultations/{consultation.id}",
            related_object_type=NotificationRelatedObjectChoices.CONSULTATION,
            related_object_id=str(consultation.id)
        )

        return Response(ConsultationDetailSerializer(consultation).data)


from .serializers import ConsultationReassignSerializer
from .services import route_consultation
from accounts.models import LeadOfficerAssignment


class KebeleConsultationListView(generics.ListAPIView):
    """
    GET /api/consultations/kebeles/<kebele_id>/consultations/
    Lead-Officer-only. All consultations within their Kebele, regardless
    of who they're currently assigned to — the oversight view.
    """
    serializer_class = ConsultationListSerializer
    permission_classes = [IsLeadOfficerOfKebele]

    def get_queryset(self):
        return Consultation.objects.filter(kebele_id=self.kwargs['kebele_id'])


class ConsultationReassignView(APIView):
    """
    POST /api/consultations/consultations/<pk>/reassign/
    Body: {officer_id, reason (optional)}
    Lead Officer of that consultation's Kebele, or any Administrator.
    Writes a new ConsultationAssignmentLog entry (assigned_by = the
    reassigning user) — full history preserved, nothing overwritten.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk)

        user = request.user
        is_admin = user.role == RoleChoices.ADMINISTRATOR
        is_lead_officer = user.role == RoleChoices.OFFICER and LeadOfficerAssignment.objects.filter(
            officer=user, kebele=consultation.kebele
        ).exists()

        if not (is_admin or is_lead_officer):
            from django.http import Http404
            raise Http404

        if consultation.status == ConsultationStatus.CLOSED:
            return Response(
                {'success': False, 'detail': 'Cannot reassign a closed consultation.', 'errors': None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConsultationReassignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_officer = serializer.validated_data['officer_id']
        reason = serializer.validated_data.get('reason', '')

        consultation.assigned_officer = new_officer
        consultation.status = ConsultationStatus.ASSIGNED
        consultation.save(update_fields=['assigned_officer', 'status', 'updated_at'])

        from .models import ConsultationAssignmentLog
        ConsultationAssignmentLog.objects.create(
            consultation=consultation,
            assigned_officer=new_officer,
            assigned_by=user,
            reason=reason or 'Manual reassignment',
        )

        from notifications.services import NotificationService
        from notifications.models import NotificationCategoryChoices, NotificationTypeChoices, NotificationRelatedObjectChoices

        NotificationService.notify_user(
            recipient=new_officer,
            title="Consultation Reassigned",
            message=f"A consultation regarding {consultation.crop_type.name} has been manually reassigned to you.",
            category=NotificationCategoryChoices.ASSIGNMENT,
            notification_type=NotificationTypeChoices.INFORMATION,
            action_url=f"/officer/consultations/{consultation.id}",
            related_object_type=NotificationRelatedObjectChoices.CONSULTATION,
            related_object_id=str(consultation.id)
        )

        return Response(ConsultationDetailSerializer(consultation).data)


class KebeleOfficerWorkloadView(APIView):
    """
    GET /api/consultations/kebeles/<kebele_id>/officer-workload/
    Lead-Officer-only. Officers assigned to this Kebele with their current
    active consultation count — used to populate the reassignment dropdown
    and give the Lead Officer visibility into workload balance.
    """
    permission_classes = [IsLeadOfficerOfKebele]

    def get(self, request, kebele_id):
        from accounts.models import OfficerKebeleAssignment
        assignments = OfficerKebeleAssignment.objects.filter(kebele_id=kebele_id).select_related('officer')
        data = []
        for a in assignments:
            active_count = Consultation.objects.filter(
                assigned_officer=a.officer
            ).exclude(status__in=[ConsultationStatus.RESOLVED, ConsultationStatus.CLOSED]).count()
            data.append({
                'officer_id': a.officer.id,
                'officer_email': a.officer.email,
                'officer_full_name': f"{a.officer.first_name} {a.officer.last_name}".strip(),
                'active_consultations': active_count,
            })
        return Response(data)




    from .serializers import (
    # ... existing ...
    ConsultationAIResultSerializer,
    ConsultationAICheckSerializer,
    ConsultationAISendSerializer,
)
from .services import run_ai_check
from predictions.services import AIServiceError


class ConsultationAICheckView(APIView):
    """
    POST /api/consultations/consultations/<pk>/ai-check/
    Body: {image_id}
    The assigned Officer only. Runs the AI check and stores a new
    ConsultationAIResult row. Visible only to the officer (never returned
    on any Farmer-facing endpoint) until they choose to send it.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk, assigned_officer=request.user)

        if consultation.status == ConsultationStatus.CLOSED:
            return Response(
                {'success': False, 'detail': 'This consultation is closed.', 'errors': None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConsultationAICheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image_obj = get_object_or_404(
            ConsultationImage, pk=serializer.validated_data['image_id'], consultation=consultation
        )

        try:
            result = run_ai_check(consultation, image_obj, request.user)
        except AIServiceError as e:
            return Response(
                {'success': False, 'detail': 'The disease detection service is currently unreachable.', 'errors': None},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            ConsultationAIResultSerializer(result, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class ConsultationAIResultListView(generics.ListAPIView):
    """
    GET /api/consultations/consultations/<pk>/ai-results/
    The assigned Officer, that Kebele's Lead Officer, or an Administrator
    only — never a Farmer (AI results are officer-internal until sent).
    """
    serializer_class = ConsultationAIResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        consultation = get_object_or_404(Consultation, pk=self.kwargs['pk'])
        user = self.request.user
        is_admin = user.role == RoleChoices.ADMINISTRATOR
        is_assigned = consultation.assigned_officer_id == user.id
        is_lead_officer = user.role == RoleChoices.OFFICER and LeadOfficerAssignment.objects.filter(
            officer=user, kebele=consultation.kebele
        ).exists()
        if not (is_admin or is_assigned or is_lead_officer):
            return ConsultationAIResult.objects.none()
        return ConsultationAIResult.objects.filter(consultation=consultation)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ConsultationAISendView(APIView):
    """
    POST /api/consultations/consultations/<pk>/ai-results/<result_id>/send/
    Body: {message}
    The assigned Officer only. Marks this AI result as sent, posts
    `message` as a normal ConsultationMessage (so the farmer sees it in
    the ordinary thread), and flips consultation status exactly like any
    other officer reply. `message` may equal the original agent_message
    (send unchanged) or a modified version (was_edited inferred by
    comparing the two).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, result_id):
        consultation = get_object_or_404(Consultation, pk=pk, assigned_officer=request.user)
        ai_result = get_object_or_404(ConsultationAIResult, pk=result_id, consultation=consultation)

        if ai_result.sent_to_farmer:
            return Response(
                {'success': False, 'detail': 'This AI result has already been sent.', 'errors': None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConsultationAISendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        final_message = serializer.validated_data['message']

        from django.utils import timezone
        ai_result.sent_to_farmer = True
        ai_result.sent_message = final_message
        ai_result.was_edited = final_message.strip() != ai_result.agent_message.strip()
        ai_result.sent_at = timezone.now()
        ai_result.save(update_fields=['sent_to_farmer', 'sent_message', 'was_edited', 'sent_at'])

        ConsultationMessage.objects.create(
            consultation=consultation,
            sender=request.user,
            message=final_message,
        )
        consultation.status = ConsultationStatus.WAITING_FOR_FARMER
        consultation.save(update_fields=['status', 'updated_at'])

        return Response(
            ConsultationAIResultSerializer(ai_result, context={'request': request}).data
        )




from .models import ConsultationNote
from .serializers import ConsultationNoteSerializer, ConsultationNoteCreateSerializer


def _is_staff_participant(user, consultation):
    """
    Shared check: Officer/Lead Officer/Administrator with a legitimate
    reason to see this consultation's internal side. Farmers never pass.
    """
    if user.role == RoleChoices.ADMINISTRATOR:
        return True
    if user.role != RoleChoices.OFFICER:
        return False
    if consultation.assigned_officer_id == user.id:
        return True
    return LeadOfficerAssignment.objects.filter(
        officer=user, kebele=consultation.kebele
    ).exists()


class ConsultationNoteListCreateView(APIView):
    """
    GET  /api/consultations/consultations/<pk>/notes/
    POST /api/consultations/consultations/<pk>/notes/
    Officer (assigned or Lead Officer of the Kebele) / Administrator only.
    Never exposed to Farmers under any circumstance (Decision E12).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk)
        if not _is_staff_participant(request.user, consultation):
            from django.http import Http404
            raise Http404
        notes = ConsultationNote.objects.filter(consultation=consultation)
        return Response(ConsultationNoteSerializer(notes, many=True).data)

    def post(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk)
        if not _is_staff_participant(request.user, consultation):
            from django.http import Http404
            raise Http404

        serializer = ConsultationNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        note = ConsultationNote.objects.create(
            consultation=consultation,
            author=request.user,
            note=serializer.validated_data['note'],
        )
        return Response(ConsultationNoteSerializer(note).data, status=status.HTTP_201_CREATED)





class ConsultationTimelineView(APIView):
    """
    GET /api/consultations/consultations/<pk>/timeline/
    Merges messages + AI-result events + assignment log entries into one
    chronologically-sorted feed, matching the example diagram from the
    module spec (Created -> Assigned -> AI Checked -> Officer Replied ->
    Farmer Follow-up -> ... -> Resolved -> Closed).

    Farmers see only: messages + status-change-implying events they're
    entitled to (creation, resolution, closure) — never internal notes,
    never unsent/internal AI-check events, never reassignment reasoning.
    Officer/Lead Officer/Administrator see the full feed including notes
    and every AI check (sent or not).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk)
        user = request.user

        is_farmer_owner = consultation.farmer_id == user.id
        is_staff = _is_staff_participant(user, consultation)

        if not (is_farmer_owner or is_staff):
            from django.http import Http404
            raise Http404

        events = []

        events.append({
            'type': 'CREATED',
            'timestamp': consultation.created_at,
            'detail': f"Consultation created by {consultation.farmer.email}",
        })

        for log in consultation.assignment_logs.all():
            if is_farmer_owner and not is_staff:
                # Farmers see that it was assigned, not to whom or why —
                # avoids exposing internal officer names/reasoning.
                events.append({
                    'type': 'ASSIGNED',
                    'timestamp': log.created_at,
                    'detail': 'Your consultation was assigned to an officer.',
                })
            else:
                events.append({
                    'type': 'REASSIGNED' if log.assigned_by_id else 'ASSIGNED',
                    'timestamp': log.created_at,
                    'detail': (
                        f"Assigned to {log.assigned_officer.email}"
                        + (f" by {log.assigned_by.email}" if log.assigned_by_id else " (automatic)")
                        + (f" — {log.reason}" if log.reason else "")
                    ),
                })

        for msg in consultation.messages.all():
            events.append({
                'type': 'MESSAGE',
                'timestamp': msg.created_at,
                'detail': f"{msg.sender.email} ({msg.sender.role}): {msg.message}",
            })

        if is_staff:
            for note in consultation.notes.all():
                events.append({
                    'type': 'NOTE',
                    'timestamp': note.created_at,
                    'detail': f"Internal note by {note.author.email}: {note.note}",
                })
            for ai in consultation.ai_results.all():
                events.append({
                    'type': 'AI_CHECK',
                    'timestamp': ai.created_at,
                    'detail': (
                        f"AI check by {ai.triggered_by.email}: "
                        + (ai.display_name if ai.is_valid_crop_image else "not recognized as a valid crop image")
                        + (" — sent to farmer" if ai.sent_to_farmer else " — not yet sent")
                    ),
                })
        else:
            for ai in consultation.ai_results.filter(sent_to_farmer=True):
                events.append({
                    'type': 'AI_CHECK_SENT',
                    'timestamp': ai.sent_at,
                    'detail': "The officer shared an AI-assisted diagnosis with you.",
                })

        if consultation.resolved_at:
            events.append({
                'type': 'RESOLVED',
                'timestamp': consultation.resolved_at,
                'detail': 'Marked resolved.',
            })
        if consultation.closed_at:
            events.append({
                'type': 'CLOSED',
                'timestamp': consultation.closed_at,
                'detail': 'Closed.',
            })

        events.sort(key=lambda e: e['timestamp'])

        return Response(events)
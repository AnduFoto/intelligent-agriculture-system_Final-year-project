from django.db import transaction
from django.utils import timezone

from accounts.models import RoleChoices, OfficerKebeleAssignment, LeadOfficerAssignment
from .models import (
    Consultation,
    ConsultationStatus,
    ConsultationAssignmentLog,
    OfficerSpecialization,
)


class RoutingError(Exception):
    """Raised only for genuine data-integrity gaps (e.g. a Kebele with no
    Lead Officer at all), never for the ordinary 'no specialized officer
    available yet' case — that case is handled by falling back to the
    Lead Officer, per Decision C8, and never raises."""
    pass


def _get_candidate_officers(consultation):
    """
    Officers who: hold a specialization mapped to this crop IN this Kebele,
    are themselves assigned to this Kebele, and are ACTIVE.
    """
    kebele = consultation.kebele
    specializations = consultation.crop_type.specializations.filter(
        kebele=kebele, is_active=True
    )
    if not specializations.exists():
        return []

    officer_ids = OfficerSpecialization.objects.filter(
        specialization__in=specializations
    ).values_list('officer_id', flat=True)

    assigned_officer_ids = OfficerKebeleAssignment.objects.filter(
        kebele=kebele
    ).values_list('officer_id', flat=True)

    from accounts.models import User
    candidates = User.objects.filter(
        id__in=officer_ids,
        role=RoleChoices.OFFICER,
        status='ACTIVE',
    ).filter(
        id__in=assigned_officer_ids,
    ).distinct()

    return list(candidates)

def _active_consultation_count(officer):
    return Consultation.objects.filter(
        assigned_officer=officer
    ).exclude(
        status__in=[ConsultationStatus.RESOLVED, ConsultationStatus.CLOSED]
    ).count()


def _last_assignment_time(officer):
    """
    Oldest-most-recent-assignment wins the round-robin tie-break: an
    officer never yet assigned anything sorts first (treated as oldest).
    """
    last_log = ConsultationAssignmentLog.objects.filter(
        assigned_officer=officer
    ).order_by('-created_at').first()
    return last_log.created_at if last_log else timezone.make_aware(timezone.datetime.min)


def _pick_officer(candidates):
    if not candidates:
        return None
    min_count = min(_active_consultation_count(o) for o in candidates)
    tied = [o for o in candidates if _active_consultation_count(o) == min_count]
    if len(tied) == 1:
        return tied[0]
    # Round robin: least-recently-assigned among the tied officers wins.
    tied.sort(key=_last_assignment_time)
    return tied[0]


@transaction.atomic
def route_consultation(consultation, assigned_by=None):
    """
    Assigns `consultation` to a qualified officer, or falls back to the
    Kebele's Lead Officer if none are available (Decision C8). Always
    writes a ConsultationAssignmentLog entry. Never rejects the farmer's
    submission — the only error case is a genuine data-integrity gap
    (a Kebele with no Lead Officer at all), which should not occur if
    Kebele setup validation (rule G) was followed.
    """
    candidates = _get_candidate_officers(consultation)
    officer = _pick_officer(candidates)

    if officer is None:
        lead_assignment = LeadOfficerAssignment.objects.filter(
            kebele=consultation.kebele
        ).first()
        if lead_assignment is None:
            raise RoutingError(
                f"Kebele '{consultation.kebele.name}' has no Lead Officer designated; "
                "cannot route this consultation."
            )
        officer = lead_assignment.officer

    consultation.assigned_officer = officer
    consultation.status = ConsultationStatus.ASSIGNED
    consultation.save(update_fields=['assigned_officer', 'status', 'updated_at'])

    ConsultationAssignmentLog.objects.create(
        consultation=consultation,
        assigned_officer=officer,
        assigned_by=assigned_by,  # None for automatic routing
        reason='' if assigned_by is None else 'Manual reassignment',
    )

    from notifications.services import NotificationService
    from notifications.models import NotificationCategoryChoices, NotificationTypeChoices, NotificationRelatedObjectChoices

    NotificationService.notify_user(
        recipient=officer,
        title="New Consultation Assigned",
        message=f"You have been assigned to a new consultation regarding {consultation.crop_type.name}.",
        category=NotificationCategoryChoices.ASSIGNMENT,
        notification_type=NotificationTypeChoices.INFORMATION,
        action_url=f"/officer/consultations/{consultation.id}",
        related_object_type=NotificationRelatedObjectChoices.CONSULTATION,
        related_object_id=str(consultation.id)
    )

    return consultation


def create_consultation(farmer, crop_type, title, description, images=None):
    """
    Creates a Consultation snapshot from the farmer's current Kebele
    (never overridable, Decision F), then immediately routes it in the
    same transaction.
    """
    if farmer.kebele_id is None:
        raise RoutingError("Farmer has no Kebele set on their profile; cannot submit a consultation.")

    with transaction.atomic():
        consultation = Consultation.objects.create(
            farmer=farmer,
            crop_type=crop_type,
            kebele=farmer.kebele,
            title=title,
            description=description,
            status=ConsultationStatus.NEW,
        )
        if images:
            from .models import ConsultationImage
            for image_file in images:
                ConsultationImage.objects.create(consultation=consultation, image=image_file)

        route_consultation(consultation, assigned_by=None)

    return consultation




from predictions.services import call_ai_prediction_service, AIServiceError


import mimetypes
from django.core.files.uploadedfile import SimpleUploadedFile
from predictions.services import call_ai_prediction_service, AIServiceError


def run_ai_check(consultation, image_obj, triggered_by):
    """
    Calls the existing, untouched AI Disease Detection service on one of
    this consultation's already-uploaded images. Always creates a new
    ConsultationAIResult row — never overwrites a prior run (Decision D11).
    Raises AIServiceError on network/timeout/unexpected-response failures,
    exactly as predictions.services already does — the view translates
    that into the normalized error response.
    """
    from .models import ConsultationAIResult

    with image_obj.image.open('rb') as f:
        file_bytes = f.read()

    file_name = image_obj.image.name.split('/')[-1]
    content_type, _ = mimetypes.guess_type(file_name)
    content_type = content_type or 'image/jpeg'

    upload_file = SimpleUploadedFile(file_name, file_bytes, content_type=content_type)

    ai_response = call_ai_prediction_service(upload_file)

    result = ConsultationAIResult.objects.create(
        consultation=consultation,
        triggered_by=triggered_by,
        image=image_obj,
        disease_class=ai_response.get('disease', ''),
        display_name=ai_response.get('display_name', ''),
        crop=ai_response.get('crop', ''),
        confidence=ai_response.get('confidence'),
        is_healthy=ai_response.get('is_healthy', False),
        is_valid_crop_image=ai_response.get('is_valid_crop_image', True),
        agent_message=ai_response.get('agent_message', ''),
        solution_detail=ai_response.get('solution_detail'),
        top_predictions=ai_response.get('top_predictions'),
    )
    return result
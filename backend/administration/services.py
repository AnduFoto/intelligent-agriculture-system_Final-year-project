import logging
from administration.models import AuditLog, ActionCategoryChoices, ActionTypeChoices

logger = logging.getLogger(__name__)


def get_client_ip(request):
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class AuditService:
    @staticmethod
    def log(
        action,
        description,
        actor=None,
        category=None,
        target_type=None,
        target_id=None,
        target_repr=None,
        request=None,
        metadata=None,
        is_success=True,
        region=None,
        zone=None,
        woreda=None,
        special_woreda=None,
        kebele=None
    ):
        try:
            # If actor not explicitly provided but request is present
            if not actor and request and hasattr(request, 'user') and request.user.is_authenticated:
                actor = request.user

            actor_name = actor.get_full_name() if actor and hasattr(actor, 'get_full_name') else (str(actor) if actor else 'System')
            actor_email = getattr(actor, 'email', None) if actor else None
            ip_address = get_client_ip(request) if request else None

            # Infer category if not provided
            if not category:
                if 'USER' in action:
                    category = ActionCategoryChoices.USER
                elif 'LOCATION' in action:
                    category = ActionCategoryChoices.LOCATION
                elif 'ASSIGNED' in action or 'UNASSIGNED' in action or 'REMOVED' in action:
                    category = ActionCategoryChoices.ASSIGNMENT
                elif 'RESOURCE' in action:
                    category = ActionCategoryChoices.EDUCATION
                elif 'CONSULTATION' in action:
                    category = ActionCategoryChoices.CONSULTATION
                else:
                    category = ActionCategoryChoices.SYSTEM

            # Auto-infer location binding from lower levels if provided
            if kebele:
                if hasattr(kebele, 'woreda') and kebele.woreda:
                    if not woreda: woreda = kebele.woreda
                elif hasattr(kebele, 'special_woreda') and kebele.special_woreda:
                    if not special_woreda: special_woreda = kebele.special_woreda

            if woreda:
                if hasattr(woreda, 'zone') and woreda.zone:
                    if not zone: zone = woreda.zone

            if zone:
                if hasattr(zone, 'region') and zone.region:
                    if not region: region = zone.region

            if special_woreda:
                if hasattr(special_woreda, 'region') and special_woreda.region:
                    if not region: region = special_woreda.region

            # Clean metadata to ensure no sensitive auth tokens/passwords are ever logged
            clean_meta = {}
            if metadata and isinstance(metadata, dict):
                for k, v in metadata.items():
                    if any(secret in k.lower() for secret in ['password', 'token', 'secret', 'key']):
                        continue
                    clean_meta[k] = v

            audit_entry = AuditLog.objects.create(
                actor=actor if (actor and hasattr(actor, 'pk')) else None,
                actor_name=actor_name,
                actor_email=actor_email,
                category=category,
                action=action,
                description=description,
                target_type=target_type or '',
                target_id=str(target_id) if target_id is not None else '',
                target_repr=target_repr or '',
                ip_address=ip_address,
                metadata=clean_meta,
                is_success=is_success,
                region=region,
                zone=zone,
                woreda=woreda,
                special_woreda=special_woreda,
                kebele=kebele
            )
            return audit_entry
        except Exception as e:
            # Audit failures must never interrupt the primary transaction
            logger.error(f"Failed to record AuditLog: {str(e)}", exc_info=True)
            return None

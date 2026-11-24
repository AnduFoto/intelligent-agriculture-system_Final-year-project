from django.db import transaction
from locations.models import Woreda, Kebele
from education.models import PublisherProfile, PublisherTypeChoices

def create_woreda_publisher_profile(woreda: Woreda) -> PublisherProfile:
    """
    Creates a PublisherProfile for a newly registered Woreda.
    Called explicitly by the location creation service/view.
    """
    profile, created = PublisherProfile.objects.get_or_create(
        woreda=woreda,
        defaults={
            'name': f"{woreda.name} Woreda Education",
            'publisher_type': PublisherTypeChoices.WOREDA,
            'description': f"Official educational resources for {woreda.name} Woreda."
        }
    )
    return profile

def create_kebele_publisher_profile(kebele: Kebele) -> PublisherProfile:
    """
    Creates a PublisherProfile for a newly registered Kebele.
    Called explicitly by the location creation service/view.
    """
    profile, created = PublisherProfile.objects.get_or_create(
        kebele=kebele,
        defaults={
            'name': f"{kebele.name} Kebele Education",
            'publisher_type': PublisherTypeChoices.KEBELE,
            'description': f"Official educational resources for {kebele.name} Kebele."
        }
    )
    return profile

def create_special_woreda_publisher_profile(special_woreda) -> PublisherProfile:
    """
    Creates a PublisherProfile for a newly registered Special Woreda.
    """
    profile, created = PublisherProfile.objects.get_or_create(
        special_woreda=special_woreda,
        defaults={
            'name': f"{special_woreda.name} Special Woreda Education",
            'publisher_type': PublisherTypeChoices.SPECIAL_WOREDA,
            'description': f"Official educational resources for {special_woreda.name} Special Woreda."
        }
    )
    return profile

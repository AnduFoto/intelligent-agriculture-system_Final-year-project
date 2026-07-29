from locations.models import Kebele
from accounts.models import RoleChoices


def get_visible_kebele_ids(user):
    """
    Returns a QuerySet of Kebele IDs the given user is currently
    permitted to browse Farmer predictions within.

    - ADMINISTRATOR: every Kebele under the Administrator's own
      Woreda (if their location chain uses Zone->Woreda) or their own
      Special Woreda (if it uses the Special Woreda path). This is
      always the FULL set for that Woreda/Special Woreda, regardless
      of whether any Farmer in it has ever made a prediction.

    - OFFICER: only the Kebeles explicitly assigned to them by an
      Administrator (via OfficerKebeleAssignment). Never the full
      Woreda/Region — only their specific assignments, which may
      span multiple different Woredas/Regions since assignment is
      direct, not hierarchy-derived.

    - Any other role (e.g. FARMER): returns an empty QuerySet, since
      Farmers never browse other Farmers' predictions.

    This is deliberately computed fresh on every call (no caching),
    per the confirmed requirement that scope must reflect the
    viewer's CURRENT Woreda/assignments at request time, not a
    snapshot taken earlier.
    """
    if user.role == RoleChoices.ADMINISTRATOR:
        if user.woreda_id:
            return Kebele.objects.filter(woreda_id=user.woreda_id)
        if user.special_woreda_id:
            return Kebele.objects.filter(special_woreda_id=user.special_woreda_id)
        return Kebele.objects.none()

    if user.role == RoleChoices.OFFICER:
        return Kebele.objects.filter(assigned_officers=user)

    return Kebele.objects.none()
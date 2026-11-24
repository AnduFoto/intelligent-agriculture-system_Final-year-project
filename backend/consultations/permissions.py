from rest_framework import permissions

from accounts.models import RoleChoices, LeadOfficerAssignment


class IsLeadOfficerOfKebele(permissions.BasePermission):
    """
    Grants access only if request.user is the Officer role AND is the
    designated Lead Officer for the Kebele identified by the view's
    `kebele_id` URL kwarg. Independently re-verifies is_authenticated,
    matching every other permission class in this project (Section 14.12).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role != RoleChoices.OFFICER:
            return False
        kebele_id = view.kwargs.get('kebele_id')
        if kebele_id is None:
            return False
        return LeadOfficerAssignment.objects.filter(
            officer=request.user, kebele_id=kebele_id
        ).exists()


class IsAdministratorReadOnlyOrWrite(permissions.BasePermission):
    """
    CropType catalog: Administrator-only for write (create/update);
    any authenticated user may read (needed by Lead Officers to see the
    catalog when mapping, and eventually by Farmers when selecting a crop
    at consultation-creation time — mirrors locations.IsAdministratorOrReadOnly's
    pattern, Section 14.12).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == RoleChoices.ADMINISTRATOR


class IsLeadOfficerOfKebeleOrAdministrator(permissions.BasePermission):
    """
    Grants access if request.user is an Administrator, OR is the Officer
    role AND the designated Lead Officer for the Kebele identified by the
    view's `kebele_id` URL kwarg. Used for endpoints both roles legitimately
    need to read (e.g. an Administrator viewing a Kebele's specializations
    while configuring crop mappings).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == RoleChoices.ADMINISTRATOR:
            return True
        if request.user.role != RoleChoices.OFFICER:
            return False
        kebele_id = view.kwargs.get('kebele_id')
        if kebele_id is None:
            return False
        return LeadOfficerAssignment.objects.filter(
            officer=request.user, kebele_id=kebele_id
        ).exists()





class IsConsultationParticipant(permissions.BasePermission):
    """
    Object-level: the consultation's Farmer, its currently assigned
    Officer, that Kebele's Lead Officer, or any Administrator. Used for
    detail/message endpoints where several roles legitimately interact
    with the same case.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.role == RoleChoices.ADMINISTRATOR:
            return True
        if obj.farmer_id == user.id:
            return True
        if obj.assigned_officer_id == user.id:
            return True
        if user.role == RoleChoices.OFFICER:
            return LeadOfficerAssignment.objects.filter(
                officer=user, kebele=obj.kebele
            ).exists()
        return False
from rest_framework.permissions import BasePermission
from rest_framework import permissions
from accounts.models import RoleChoices
from .models import LeadOfficerAssignment
from locations.models import Kebele

class IsFarmer(BasePermission):
    """
    Allows access only to authenticated users with the Farmer role.
    """
    message = "Only Farmers are permitted to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == RoleChoices.FARMER
        )


class IsOfficer(BasePermission):
    """
    Allows access only to authenticated users with the Agriculture
    Officer role.
    """
    message = "Only Agriculture Officers are permitted to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == RoleChoices.OFFICER
        )


class IsAdministrator(BasePermission):
    """
    Allows access only to authenticated users with the Administrator role.
    """
    message = "Only Administrators are permitted to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == RoleChoices.ADMINISTRATOR
        )


class IsOfficerOrAdministrator(BasePermission):
    """
    Allows access to either Agriculture Officers or Administrators.
    Useful for endpoints where both roles share the same capability
    (e.g., moderation-adjacent actions in future modules).
    """
    message = "Only Agriculture Officers or Administrators are permitted to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (RoleChoices.OFFICER, RoleChoices.ADMINISTRATOR)
        )


class IsOfficerOrAdministrator(BasePermission):
    """
    Allows access to either Agriculture Officers or Administrators.
    Useful for endpoints where both roles share the same capability
    (e.g., moderation-adjacent actions in future modules).
    """
    message = "Only Agriculture Officers or Administrators are permitted to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in (RoleChoices.OFFICER, RoleChoices.ADMINISTRATOR)
        )


class IsLeadOfficerForKebele(permissions.BasePermission):
    """
    Object-level permission: passes only if request.user is the designated
    Lead Officer for the Kebele identified by `obj` (a Kebele instance) or
    by the view's `kebele_id` URL kwarg (checked in has_permission for
    list-style endpoints that don't have a single object to check against).
    Independently re-verifies is_authenticated, matching every other
    permission class in this file.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role != RoleChoices.OFFICER:
            return False
        kebele_id = view.kwargs.get('kebele_id')
        if kebele_id is None:
            return True  # defer to has_object_permission where applicable
        return LeadOfficerAssignment.objects.filter(
            officer=request.user, kebele_id=kebele_id
        ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        kebele = obj if isinstance(obj, Kebele) else getattr(obj, 'kebele', None)
        if kebele is None:
            return False
        return LeadOfficerAssignment.objects.filter(
            officer=request.user, kebele=kebele
        ).exists()


class IsAdminOrLeadOfficerListingOfficers(permissions.BasePermission):
    """
    Allows Administrators full user list access.
    Allows designated Lead Officers to list officers (role=OFFICER).
    """
    message = "Only Administrators or Lead Officers listing officers are permitted to perform this action."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == RoleChoices.ADMINISTRATOR:
            return True
        if request.user.role == RoleChoices.OFFICER:
            is_lead = LeadOfficerAssignment.objects.filter(officer=request.user).exists()
            role_param = request.query_params.get('role', '').upper()
            if is_lead and role_param == 'OFFICER':
                return True
        return False
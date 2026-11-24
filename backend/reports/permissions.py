from rest_framework import permissions
from accounts.models import RoleChoices
from locations.models import Kebele

class IsAdministrator(permissions.BasePermission):
    """
    Allows access only to authenticated users with the Administrator role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == RoleChoices.ADMINISTRATOR
        )

class IsOfficer(permissions.BasePermission):
    """
    Allows access only to authenticated users with the Officer role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == RoleChoices.OFFICER
        )

class IsLeadOfficer(permissions.BasePermission):
    """
    Allows access only if the Officer is a Lead Officer for at least one Kebele.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role != RoleChoices.OFFICER:
            return False
        return hasattr(request.user, 'lead_officer_assignment') and request.user.lead_officer_assignment is not None

class IsFarmer(permissions.BasePermission):
    """
    Allows access only to authenticated users with the Farmer role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == RoleChoices.FARMER
        )

class IsAuthorizedForReports(permissions.BasePermission):
    """
    Allows access to anyone authenticated. The scope of the report is filtered at the queryset/service level based on the role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

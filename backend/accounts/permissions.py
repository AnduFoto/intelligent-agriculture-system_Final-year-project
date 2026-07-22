from rest_framework.permissions import BasePermission

from accounts.models import RoleChoices


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


class IsOwnerOrAdministrator(BasePermission):
    """
    Object-level permission: allows access if the requesting user IS
    the object in question (e.g., viewing/editing their own profile),
    or if the requesting user is an Administrator (who can manage any
    user's account).

    Intended for use alongside IsAuthenticated on views that operate
    on a specific User instance (e.g., retrieve/update a single user
    by ID in the Admin User Management views, Step 29).
    """
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        if request.user.role == RoleChoices.ADMINISTRATOR:
            return True
        return obj == request.user
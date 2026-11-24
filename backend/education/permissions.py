from rest_framework import permissions
from accounts.models import RoleChoices
from education.models import WoredaEducationalManagerAssignment, KebeleEducationalManagerAssignment

class IsWoredaEducationalManager(permissions.BasePermission):
    """
    Checks if the user has an active WoredaEducationalManagerAssignment.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role != RoleChoices.OFFICER:
            return False
        return WoredaEducationalManagerAssignment.objects.filter(officer=request.user).exists()


class IsKebeleEducationalManager(permissions.BasePermission):
    """
    Checks if the user has an active KebeleEducationalManagerAssignment.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role != RoleChoices.OFFICER:
            return False
        return KebeleEducationalManagerAssignment.objects.filter(officer=request.user).exists()


class CanCreateEducationalContent(permissions.BasePermission):
    """
    Checks if a user is authorized to CREATE new educational content.
    Authorized users include:
    - Administrators
    - Lead Officers
    - Woreda Educational Managers
    - Kebele Educational Managers (officers assigned by a lead officer)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        user = request.user
        if not user or not user.is_authenticated:
            return False
            
        if user.role == RoleChoices.ADMINISTRATOR:
            return True
            
        if user.role != RoleChoices.OFFICER:
            return False
            
        # Is Lead Officer?
        if hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
            return True
            
        # Is Woreda Manager?
        if WoredaEducationalManagerAssignment.objects.filter(officer=user).exists():
            return True
            
        # Is Kebele Manager (assigned by Lead Officer)?
        if KebeleEducationalManagerAssignment.objects.filter(officer=user).exists():
            return True
            
        return False


class IsPublisherManagerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to check if the user can edit a specific PublisherProfile.
    - Administrators can edit any Woreda publisher profile.
    - Lead Officers can edit their own Kebele publisher profile.
    - Nobody else can edit publisher profiles.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == RoleChoices.ADMINISTRATOR:
            # Admins can edit WOREDA profiles, or KEBELE profiles if needed, 
            # though usually they focus on WOREDA. The requirement says:
            # "Administrator can manage every Woreda Education profile."
            if obj.publisher_type == 'WOREDA':
                return True
            # Let Admins manage Kebele profiles too just in case, or stick strictly to Woreda?
            # "Administrator can manage every Woreda Education profile." 
            # We'll allow it for all as a fallback, but UI can restrict.
            return True
            
        if request.user.role == RoleChoices.OFFICER:
            # Check if this officer is the Lead Officer for the kebele linked to this profile
            if obj.publisher_type == 'KEBELE' and obj.kebele:
                if hasattr(request.user, 'lead_officer_assignment'):
                    return request.user.lead_officer_assignment.kebele_id == obj.kebele_id
        
        return False


class IsResourceAuthorOrAdmin(permissions.BasePermission):
    """
    Object-level permission to check if the user can edit a specific Resource.
    Only the creator of the resource or an Administrator can edit/archive it.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Allow read-only access to all authenticated users
        if request.method in permissions.SAFE_METHODS:
            # We can optionally restrict reading DRAFT/ARCHIVED to author/admin
            # but if it's PUBLISHED, anyone can read.
            if obj.status == 'PUBLISHED':
                return True
            # If not published, only author/admin can read
            if request.user.role == RoleChoices.ADMINISTRATOR or obj.created_by_id == request.user.id:
                return True
            return False

        # Admins have full access
        if request.user.role == RoleChoices.ADMINISTRATOR:
            return True
            
        # The author has full access
        if obj.created_by_id == request.user.id:
            return True
            
        return False

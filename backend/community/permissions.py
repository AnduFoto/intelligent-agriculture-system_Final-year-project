from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to allow authors of a post or comment to edit/delete it.
    Administrators also have full access for moderation.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Social actions (liking, commenting, sharing, reporting) are open to all authenticated users
        if getattr(view, 'action', None) in ['toggle_like', 'comments', 'share', 'report']:
            return request.user and request.user.is_authenticated

        # Check if user is the author
        author = getattr(obj, 'author', None) or getattr(obj, 'user', None) or getattr(obj, 'reporter', None)
        if author and author == request.user:
            return True

        # Administrators have permission to moderate
        return request.user and request.user.is_authenticated and request.user.role == 'ADMINISTRATOR'


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to authenticated Administrator users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ADMINISTRATOR'
        )

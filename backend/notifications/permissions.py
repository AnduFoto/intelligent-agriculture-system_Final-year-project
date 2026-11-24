from rest_framework.permissions import BasePermission

class IsNotificationOwner(BasePermission):
    """
    Object-level permission to only allow owners of a notification to access or modify it.
    """
    message = "You do not have permission to access this notification."

    def has_object_permission(self, request, view, obj):
        return obj.recipient == request.user

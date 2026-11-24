from rest_framework.permissions import BasePermission
from accounts.models import RoleChoices, StatusChoices
from chat.models import Conversation


class IsConversationParticipant(BasePermission):
    """
    Allows access only to authenticated users who are participants in the conversation.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # If obj is Conversation
        if isinstance(obj, Conversation):
            return request.user.id in (obj.user1_id, obj.user2_id)
        
        # If obj is Message
        if hasattr(obj, 'conversation'):
            return request.user.id in (obj.conversation.user1_id, obj.conversation.user2_id)

        return False


class IsNotSuspended(BasePermission):
    """
    Prevents suspended users from performing messaging actions.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.status != StatusChoices.SUSPENDED and request.user.is_active


class IsChatAdmin(BasePermission):
    """
    Allows access only to System Administrators.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == RoleChoices.ADMINISTRATOR
        )

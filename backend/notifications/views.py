from rest_framework import generics, views, status, filters, pagination
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from notifications.models import Notification
from notifications.serializers import NotificationSerializer, NotificationBatchActionSerializer
from notifications.permissions import IsNotificationOwner

class NotificationPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'limit'
    max_page_size = 100

class NotificationListView(generics.ListAPIView):
    """
    List user's active notifications. Supports filtering and pagination.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['is_read', 'category', 'priority', 'notification_type']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    search_fields = ['title', 'message']

    def get_queryset(self):
        return Notification.active_objects.filter(recipient=self.request.user)


class UnreadNotificationCountView(views.APIView):
    """
    Returns the count of unread notifications for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.active_objects.filter(recipient=request.user, is_read=False).count()
        return Response({'unread_count': count})


class NotificationReadView(views.APIView):
    """
    Mark a specific notification as read.
    """
    permission_classes = [IsAuthenticated, IsNotificationOwner]

    def post(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.active_objects.get(pk=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at'])
            
        return Response(NotificationSerializer(notification).data)


class NotificationDeleteView(views.APIView):
    """
    Soft-delete a specific notification.
    """
    permission_classes = [IsAuthenticated, IsNotificationOwner]

    def delete(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.active_objects.get(pk=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
            
        notification.deleted_at = timezone.now()
        notification.save(update_fields=['deleted_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationMarkAllReadView(views.APIView):
    """
    Mark all active unread notifications as read for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        notifications = Notification.active_objects.filter(recipient=request.user, is_read=False)
        count = notifications.update(is_read=True, read_at=timezone.now())
        return Response({'marked_count': count})


class NotificationDeleteAllView(views.APIView):
    """
    Soft-delete all active notifications for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        notifications = Notification.active_objects.filter(recipient=request.user)
        count = notifications.update(deleted_at=timezone.now())
        return Response({'deleted_count': count}, status=status.HTTP_200_OK)


class NotificationBatchActionView(views.APIView):
    """
    Perform batch actions (read, delete) on selected notifications.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, action, *args, **kwargs):
        if action not in ['read', 'delete']:
            return Response({"detail": "Invalid action. Use 'read' or 'delete'."}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = NotificationBatchActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        notification_ids = serializer.validated_data['notification_ids']
        notifications = Notification.active_objects.filter(
            recipient=request.user, 
            id__in=notification_ids
        )
        
        if action == 'read':
            count = notifications.filter(is_read=False).update(is_read=True, read_at=timezone.now())
            return Response({'marked_count': count})
        elif action == 'delete':
            count = notifications.update(deleted_at=timezone.now())
            return Response({'deleted_count': count})

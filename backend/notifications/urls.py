from django.urls import path
from notifications.views import (
    NotificationListView,
    UnreadNotificationCountView,
    NotificationReadView,
    NotificationDeleteView,
    NotificationMarkAllReadView,
    NotificationDeleteAllView,
    NotificationBatchActionView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', UnreadNotificationCountView.as_view(), name='notification-unread-count'),
    path('<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('<int:pk>/', NotificationDeleteView.as_view(), name='notification-delete'),
    path('read-all/', NotificationMarkAllReadView.as_view(), name='notification-read-all'),
    path('delete-all/', NotificationDeleteAllView.as_view(), name='notification-delete-all'),
    path('batch/<str:action>/', NotificationBatchActionView.as_view(), name='notification-batch-action'),
]

from django.urls import path
from administration.views import (
    AuditLogListView,
    AuditLogDetailView,
    AuditLogExportPDFView,
    SystemAdminDashboardStatsView,
)

urlpatterns = [
    path('stats/', SystemAdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('activity/', AuditLogListView.as_view(), name='admin-activity-list'),
    path('activity/export-pdf/', AuditLogExportPDFView.as_view(), name='admin-activity-export-pdf'),
    path('activity/<int:pk>/', AuditLogDetailView.as_view(), name='admin-activity-detail'),
]

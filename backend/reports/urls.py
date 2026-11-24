from django.urls import path
from .api_views import (
    OverviewReportAPIView, ConsultationReportAPIView, AIReportAPIView, 
    EducationReportAPIView, ExportReportAPIView, UsersReportAPIView,
    FarmersReportAPIView, CropsReportAPIView, SpecializationsReportAPIView
)

urlpatterns = [
    path('overview/', OverviewReportAPIView.as_view(), name='report-overview'),
    path('consultations/', ConsultationReportAPIView.as_view(), name='report-consultations'),
    path('ai/', AIReportAPIView.as_view(), name='report-ai'),
    path('education/', EducationReportAPIView.as_view(), name='report-education'),
    path('users/', UsersReportAPIView.as_view(), name='report-users'),
    path('farmers/', FarmersReportAPIView.as_view(), name='report-farmers'),
    path('crops/', CropsReportAPIView.as_view(), name='report-crops'),
    path('specializations/', SpecializationsReportAPIView.as_view(), name='report-specializations'),
    path('export/', ExportReportAPIView.as_view(), name='report-export'),
]

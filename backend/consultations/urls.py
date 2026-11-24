from django.urls import path

from .views import (
    KebeleSpecializationListCreateView,
    KebeleSpecializationDetailView,
    KebeleEligibleOfficersView,
    OfficerSpecializationAssignView,
    OfficerSpecializationRemoveView,
    CropTypeListCreateView,
    CropTypeDetailView,
    KebeleCropMappingListView,
    KebeleCropMappingView,
    ConsultationCreateView,
    MyConsultationListView,
    ConsultationDetailView,
    ConsultationMessageCreateView,
    ConsultationCloseView,
    ConsultationResolveView,
    KebeleConsultationListView,
    ConsultationReassignView,
    KebeleOfficerWorkloadView,
    ConsultationAICheckView,
    ConsultationAIResultListView,
    ConsultationAISendView,
    ConsultationNoteListCreateView,
    ConsultationTimelineView,

)

urlpatterns = [
    path('kebeles/<int:kebele_id>/specializations/', KebeleSpecializationListCreateView.as_view(), name='kebele-specializations'),
    path('kebeles/<int:kebele_id>/specializations/<int:pk>/', KebeleSpecializationDetailView.as_view(), name='kebele-specialization-detail'),
    path('kebeles/<int:kebele_id>/eligible-officers/', KebeleEligibleOfficersView.as_view(), name='kebele-eligible-officers'),
    path('kebeles/<int:kebele_id>/officer-specializations/', OfficerSpecializationAssignView.as_view(), name='officer-specialization-assign'),
    path('kebeles/<int:kebele_id>/officer-specializations/<int:pk>/', OfficerSpecializationRemoveView.as_view(), name='officer-specialization-remove'),

    path('crop-types/', CropTypeListCreateView.as_view(), name='crop-type-list-create'),
    path('crop-types/<int:pk>/', CropTypeDetailView.as_view(), name='crop-type-detail'),
    path('kebeles/<int:kebele_id>/crop-mappings/', KebeleCropMappingListView.as_view(), name='kebele-crop-mappings'),
    path('kebeles/<int:kebele_id>/crop-mappings/<int:crop_id>/', KebeleCropMappingView.as_view(), name='kebele-crop-mapping-detail'),

    path('consultations/', ConsultationCreateView.as_view(), name='consultation-create'),
    path('consultations/mine/', MyConsultationListView.as_view(), name='consultation-mine'),
    path('consultations/<int:pk>/', ConsultationDetailView.as_view(), name='consultation-detail'),
    path('consultations/<int:pk>/messages/', ConsultationMessageCreateView.as_view(), name='consultation-message-create'),
    path('consultations/<int:pk>/close/', ConsultationCloseView.as_view(), name='consultation-close'),
    path('consultations/<int:pk>/resolve/', ConsultationResolveView.as_view(), name='consultation-resolve'),

    path('kebeles/<int:kebele_id>/consultations/', KebeleConsultationListView.as_view(), name='kebele-consultations'),
    path('kebeles/<int:kebele_id>/officer-workload/', KebeleOfficerWorkloadView.as_view(), name='kebele-officer-workload'),
    path('consultations/<int:pk>/reassign/', ConsultationReassignView.as_view(), name='consultation-reassign'),
    path('consultations/<int:pk>/ai-check/', ConsultationAICheckView.as_view(), name='consultation-ai-check'),
    path('consultations/<int:pk>/ai-results/', ConsultationAIResultListView.as_view(), name='consultation-ai-results'),
    path('consultations/<int:pk>/ai-results/<int:result_id>/send/', ConsultationAISendView.as_view(), name='consultation-ai-send'),
    path('consultations/<int:pk>/notes/', ConsultationNoteListCreateView.as_view(), name='consultation-notes'),
    path('consultations/<int:pk>/timeline/', ConsultationTimelineView.as_view(), name='consultation-timeline'),

]


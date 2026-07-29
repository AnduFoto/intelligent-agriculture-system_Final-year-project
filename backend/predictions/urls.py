from django.urls import path
from predictions.views import KebeleBrowseListView
from predictions.views import KebeleBrowseListView, CropBrowseListView
from predictions.views import KebeleBrowseListView, CropBrowseListView, FarmerBrowseListView
from predictions.views import KebeleBrowseListView, CropBrowseListView, FarmerBrowseListView, FarmerHistoryBrowseView
from predictions.views import (
    PredictDiseaseView,
    PredictionHistoryListView,
    PredictionHistoryDetailView,
)

app_name = 'predictions'

urlpatterns = [
    path('predict/', PredictDiseaseView.as_view(), name='predict'),
    path('history/', PredictionHistoryListView.as_view(), name='history-list'),
    path('history/<int:pk>/', PredictionHistoryDetailView.as_view(), name='history-detail'),
    path('browse/kebeles/', KebeleBrowseListView.as_view(), name='browse-kebeles'),
    path('browse/kebeles/<int:kebele_id>/crops/', CropBrowseListView.as_view(), name='browse-crops'),
    path('browse/kebeles/<int:kebele_id>/crops/<str:crop>/farmers/', FarmerBrowseListView.as_view(), name='browse-farmers'),
    path('browse/farmers/<int:farmer_id>/history/', FarmerHistoryBrowseView.as_view(), name='browse-farmer-history'),
]
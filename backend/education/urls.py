from django.urls import path
from education.views import (
    PublisherProfileListView,
    PublisherProfileDetailView,
    CategoryListCreateView,
    CategoryDetailView,
    TopicListCreateView,
    ResourceListView,
    ResourceDetailView,
    BookmarkToggleView,
    BookmarkedResourceListView,
    RecommendationView,
    ConsultationAttachedResourceListCreateView,
    WoredaEducationalManagerAssignmentListCreateView,
    WoredaEducationalManagerAssignmentDetailView,
    KebeleEducationalManagerAssignmentListCreateView,
    KebeleEducationalManagerAssignmentDetailView,
    MyEducationalManagerStatusView
)

urlpatterns = [
    # Status Check
    path('my-manager-status/', MyEducationalManagerStatusView.as_view(), name='my-manager-status'),

    # Publisher Profiles
    path('publishers/', PublisherProfileListView.as_view(), name='publisher-list'),
    path('publishers/<int:pk>/', PublisherProfileDetailView.as_view(), name='publisher-detail'),
    
    # Categories
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # Topics
    path('topics/', TopicListCreateView.as_view(), name='topic-list-create'),
    
    # Resources
    path('resources/', ResourceListView.as_view(), name='resource-list'),
    path('resources/<int:pk>/', ResourceDetailView.as_view(), name='resource-detail'),
    path('resources/<int:pk>/bookmark/', BookmarkToggleView.as_view(), name='resource-bookmark'),
    path('resources/bookmarked/', BookmarkedResourceListView.as_view(), name='resource-bookmarked-list'),
    
    # AI Recommendations
    path('recommendations/', RecommendationView.as_view(), name='resource-recommendations'),
    
    # Consultation Attachments
    path('attachments/', ConsultationAttachedResourceListCreateView.as_view(), name='consultation-attachments'),
    
    # Manager Assignments
    path('woreda-managers/', WoredaEducationalManagerAssignmentListCreateView.as_view(), name='woreda-manager-list'),
    path('woreda-managers/<int:pk>/', WoredaEducationalManagerAssignmentDetailView.as_view(), name='woreda-manager-detail'),
    path('kebele-managers/', KebeleEducationalManagerAssignmentListCreateView.as_view(), name='kebele-manager-list'),
    path('kebele-managers/<int:pk>/', KebeleEducationalManagerAssignmentDetailView.as_view(), name='kebele-manager-detail'),
]

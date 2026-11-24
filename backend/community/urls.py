from django.urls import path, include
from rest_framework.routers import DefaultRouter
from community.views import PostViewSet, CommentViewSet, PostReportViewSet, community_trending

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='community-post')
router.register(r'comments', CommentViewSet, basename='community-comment')
router.register(r'reports', PostReportViewSet, basename='community-report')

urlpatterns = [
    path('trending/', community_trending, name='community-trending'),
    path('', include(router.urls)),
]

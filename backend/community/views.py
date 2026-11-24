from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F, ExpressionWrapper, IntegerField

from community.models import Post, Comment, PostReport, ReportStatusChoices
from community.serializers import (
    PostSerializer, CommentSerializer, PostShareSerializer, PostReportSerializer
)
from community.services import CommunityService
from community.permissions import IsAuthorOrReadOnly, IsAdminUser
from community.filters import PostFilter
from education.models import Resource
from education.serializers import ResourceListSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PostFilter

    def get_queryset(self):
        qs = Post.objects.filter(is_deleted=False).select_related(
            'author', 'crop_type', 'region', 'zone', 'woreda', 'special_woreda', 'kebele'
        ).prefetch_related('media_files')

        sort_param = self.request.query_params.get('sort', 'latest')
        if sort_param == 'popular':
            qs = qs.annotate(
                engagement=ExpressionWrapper(F('likes_count') + F('comments_count') * 2 + F('shares_count') * 3, output_field=IntegerField())
            ).order_by('-engagement', '-created_at')
        else:
            qs = qs.order_by('-created_at')

        return qs

    def create(self, request, *args, **kwargs):
        content = request.data.get('content', '')
        post_type = request.data.get('post_type', 'TEXT')
        visibility = request.data.get('visibility', 'PUBLIC')
        crop_type_id = request.data.get('crop_type') or None

        region_id = request.data.get('region') or (getattr(request.user, 'region_id', None))
        zone_id = request.data.get('zone') or (getattr(request.user, 'zone_id', None))
        woreda_id = request.data.get('woreda') or (getattr(request.user, 'woreda_id', None))
        special_woreda_id = request.data.get('special_woreda') or (getattr(request.user, 'special_woreda_id', None))
        kebele_id = request.data.get('kebele') or (getattr(request.user, 'kebele_id', None))

        # Parse media files
        media_files = []
        files = request.FILES.getlist('files')
        media_types = request.data.getlist('media_types')

        for idx, file_obj in enumerate(files):
            m_type = media_types[idx] if idx < len(media_types) else ('VIDEO' if file_obj.content_type.startswith('video/') else 'IMAGE')
            media_files.append({'file': file_obj, 'media_type': m_type})

        post = CommunityService.create_post(
            author=request.user,
            content=content,
            post_type=post_type,
            visibility=visibility,
            crop_type_id=crop_type_id,
            region_id=region_id,
            zone_id=zone_id,
            woreda_id=woreda_id,
            special_woreda_id=special_woreda_id,
            kebele_id=kebele_id,
            media_files=media_files
        )

        serializer = self.get_serializer(post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        post = self.get_object()
        content = request.data.get('content')
        crop_type_id = request.data.get('crop_type')
        updated_post = CommunityService.update_post(post, request.user, content, crop_type_id)
        serializer = self.get_serializer(updated_post)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        post = self.get_object()
        CommunityService.delete_post(post, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post', 'delete'], url_path='like')
    def toggle_like(self, request, pk=None):
        post = self.get_object()
        liked, likes_count = CommunityService.toggle_like(post, request.user)
        return Response({'liked': liked, 'likes_count': likes_count})

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, pk=None):
        post = self.get_object()
        if request.method == 'GET':
            # List top-level comments for this post
            comments_qs = Comment.objects.filter(
                post=post, parent_comment__isnull=True, is_deleted=False
            ).select_related('author').prefetch_related('replies')
            serializer = CommentSerializer(comments_qs, many=True, context={'request': request, 'user': request.user})
            return Response(serializer.data)

        elif request.method == 'POST':
            content = request.data.get('content', '').strip()
            parent_comment_id = request.data.get('parent_comment') or None
            if not content:
                return Response({'detail': 'Comment content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

            comment = CommunityService.create_comment(
                post=post,
                author=request.user,
                content=content,
                parent_comment_id=parent_comment_id
            )
            serializer = CommentSerializer(comment, context={'request': request, 'user': request.user})
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='share')
    def share(self, request, pk=None):
        post = self.get_object()
        optional_text = request.data.get('optional_text', '')
        share_obj = CommunityService.share_post(post, request.user, optional_text)
        serializer = PostShareSerializer(share_obj, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='report')
    def report(self, request, pk=None):
        post = self.get_object()
        reason = request.data.get('reason', 'INAPPROPRIATE')
        description = request.data.get('description', '')
        report_obj = CommunityService.report_post(
            reporter=request.user,
            post_id=post.id,
            reason=reason,
            description=description
        )
        serializer = PostReportSerializer(report_obj, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.filter(is_deleted=False)
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]

    def partial_update(self, request, pk=None):
        comment = self.get_object()
        content = request.data.get('content')
        if not content:
            return Response({'detail': 'Content is required.'}, status=status.HTTP_400_BAD_REQUEST)
        updated_comment = CommunityService.update_comment(comment, request.user, content)
        serializer = self.get_serializer(updated_comment)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        comment = self.get_object()
        CommunityService.delete_comment(comment, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post', 'delete'], url_path='like')
    def toggle_like(self, request, pk=None):
        comment = self.get_object()
        liked, likes_count = CommunityService.toggle_comment_like(comment, request.user)
        return Response({'liked': liked, 'likes_count': likes_count})

    @action(detail=True, methods=['post'], url_path='report')
    def report(self, request, pk=None):
        comment = self.get_object()
        reason = request.data.get('reason', 'INAPPROPRIATE')
        description = request.data.get('description', '')
        report_obj = CommunityService.report_post(
            reporter=request.user,
            comment_id=comment.id,
            reason=reason,
            description=description
        )
        serializer = PostReportSerializer(report_obj, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PostReportViewSet(viewsets.ModelViewSet):
    serializer_class = PostReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = PostReport.objects.select_related('reporter', 'post', 'comment', 'reviewed_by').order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def partial_update(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status', ReportStatusChoices.ACTION_TAKEN)
        admin_note = request.data.get('admin_note', '')
        action_type = request.data.get('action_type', 'REMOVE') # 'DISMISS', 'REMOVE', 'WARN', 'SUSPEND'

        resolved_report = CommunityService.resolve_report(
            report=report,
            admin_user=request.user,
            status=new_status,
            admin_note=admin_note,
            action_type=action_type
        )
        serializer = self.get_serializer(resolved_report)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def community_trending(request):
    """
    Returns trending posts and recent educational resources for the community sidebar.
    """
    popular_posts = Post.objects.filter(is_deleted=False).select_related(
        'author', 'crop_type'
    ).order_by('-likes_count', '-comments_count')[:5]
    post_serializer = PostSerializer(popular_posts, many=True, context={'request': request})

    recent_resources = Resource.objects.filter(status='PUBLISHED').select_related('publisher').order_by('-published_date')[:4]
    resource_serializer = ResourceListSerializer(recent_resources, many=True, context={'request': request})

    trending_topics = [
        {"id": 1, "name": "#MaizeDiseaseControl", "count": 42},
        {"id": 2, "name": "#CoffeeHarvest2026", "count": 28},
        {"id": 3, "name": "#WheatIrrigationTips", "count": 19},
        {"id": 4, "name": "#SoilConservation", "count": 15},
    ]

    return Response({
        'popular_posts': post_serializer.data,
        'recent_resources': resource_serializer.data,
        'trending_topics': trending_topics
    })

from rest_framework import serializers
from django.contrib.auth import get_user_model
from community.models import (
    Post, PostMedia, PostLike, Comment, CommentLike, PostShare, PostReport,
    PostTypeChoices, PostVisibilityChoices, MediaTypeChoices, ReportReasonChoices, ReportStatusChoices
)
from consultations.models import CropType
from locations.models import Region, Zone, Woreda, SpecialWoreda, Kebele

User = get_user_model()


class SafeAuthorSerializer(serializers.ModelSerializer):
    """
    Public author representation for posts and comments.
    Exposes only safe user fields without compromising authentication details.
    """
    full_name = serializers.SerializerMethodField()
    location_summary = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'role',
            'profile_image', 'profile_image_url', 'location_summary'
        ]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_profile_image_url(self, obj):
        if obj.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def get_location_summary(self, obj):
        if obj.kebele:
            return f"Kebele: {obj.kebele.name}"
        if obj.special_woreda:
            return f"Special Woreda: {obj.special_woreda.name}"
        if obj.woreda:
            return f"Woreda: {obj.woreda.name}"
        if obj.region:
            return f"Region: {obj.region.name}"
        return None


class PostMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = PostMedia
        fields = ['id', 'file', 'file_url', 'media_type', 'created_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class CommentSerializer(serializers.ModelSerializer):
    author = SafeAuthorSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'content', 'parent_comment',
            'likes_count', 'is_edited', 'is_liked', 'is_owner', 'replies',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'likes_count', 'is_edited', 'created_at', 'updated_at']

    def get_is_liked(self, obj):
        user = self.context.get('user') or (self.context.get('request').user if self.context.get('request') else None)
        if user and user.is_authenticated:
            return CommentLike.objects.filter(comment=obj, user=user).exists()
        return False

    def get_is_owner(self, obj):
        user = self.context.get('user') or (self.context.get('request').user if self.context.get('request') else None)
        if user and user.is_authenticated:
            return obj.author_id == user.id
        return False

    def get_replies(self, obj):
        if obj.parent_comment_id is None: # Only serialize 1 level of replies for top-level comments
            replies_qs = obj.replies.filter(is_deleted=False).select_related('author')
            return CommentSerializer(replies_qs, many=True, context=self.context).data
        return []


class PostSerializer(serializers.ModelSerializer):
    author = SafeAuthorSerializer(read_only=True)
    media_files = PostMediaSerializer(many=True, read_only=True)
    crop_name = serializers.CharField(source='crop_type.name', read_only=True, default=None)
    region_name = serializers.CharField(source='region.name', read_only=True, default=None)
    zone_name = serializers.CharField(source='zone.name', read_only=True, default=None)
    woreda_name = serializers.CharField(source='woreda.name', read_only=True, default=None)
    special_woreda_name = serializers.CharField(source='special_woreda.name', read_only=True, default=None)
    kebele_name = serializers.CharField(source='kebele.name', read_only=True, default=None)
    location_summary = serializers.SerializerMethodField()
    
    is_liked = serializers.SerializerMethodField()
    is_shared = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'content', 'post_type', 'visibility',
            'crop_type', 'crop_name',
            'region', 'region_name', 'zone', 'zone_name',
            'woreda', 'woreda_name', 'special_woreda', 'special_woreda_name',
            'kebele', 'kebele_name', 'location_summary',
            'media_files', 'likes_count', 'comments_count', 'shares_count',
            'is_liked', 'is_shared', 'is_owner', 'is_edited',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'author', 'likes_count', 'comments_count', 'shares_count',
            'is_edited', 'created_at', 'updated_at'
        ]

    def get_location_summary(self, obj):
        if obj.kebele:
            return f"Kebele: {obj.kebele.name}"
        if obj.special_woreda:
            return f"Special Woreda: {obj.special_woreda.name}"
        if obj.woreda:
            return f"Woreda: {obj.woreda.name}"
        if obj.author:
            if getattr(obj.author, 'kebele', None):
                return f"Kebele: {obj.author.kebele.name}"
            if getattr(obj.author, 'special_woreda', None):
                return f"Special Woreda: {obj.author.special_woreda.name}"
            if getattr(obj.author, 'woreda', None):
                return f"Woreda: {obj.author.woreda.name}"
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostLike.objects.filter(post=obj, user=request.user).exists()
        return False

    def get_is_shared(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PostShare.objects.filter(post=obj, user=request.user).exists()
        return False

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author_id == request.user.id
        return False


class PostShareSerializer(serializers.ModelSerializer):
    user = SafeAuthorSerializer(read_only=True)
    post_details = PostSerializer(source='post', read_only=True)

    class Meta:
        model = PostShare
        fields = ['id', 'post', 'post_details', 'user', 'optional_text', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class PostReportSerializer(serializers.ModelSerializer):
    reporter = SafeAuthorSerializer(read_only=True)
    post_details = PostSerializer(source='post', read_only=True)
    comment_details = CommentSerializer(source='comment', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = PostReport
        fields = [
            'id', 'reporter', 'post', 'post_details', 'comment', 'comment_details',
            'reason', 'description', 'status', 'reviewed_by', 'reviewed_by_name',
            'admin_note', 'reviewed_at', 'created_at'
        ]
        read_only_fields = ['id', 'reporter', 'reviewed_by', 'reviewed_at', 'created_at']

from rest_framework import serializers
from education.models import (
    PublisherProfile,
    WoredaEducationalManagerAssignment,
    KebeleEducationalManagerAssignment,
    Category,
    Topic,
    Resource,
    ResourceAttachment,
    ResourceImage,
    Bookmark,
    RecentlyViewed,
    ConsultationAttachedResource
)
from locations.serializers import WoredaSerializer, KebeleSerializer
from accounts.models import User
from consultations.serializers import CropTypeSerializer


class PublisherProfileSerializer(serializers.ModelSerializer):
    woreda_name = serializers.CharField(source='woreda.name', read_only=True)
    kebele_name = serializers.CharField(source='kebele.name', read_only=True)
    educational_team = serializers.SerializerMethodField()

    class Meta:
        model = PublisherProfile
        fields = [
            'id', 'name', 'publisher_type', 'woreda', 'kebele',
            'woreda_name', 'kebele_name', 'cover_image', 'logo',
            'description', 'contact_email', 'contact_phone', 
            'office_address', 'educational_team', 'created_at', 'updated_at'
        ]
        read_only_fields = ['name', 'publisher_type', 'woreda', 'kebele', 'created_at', 'updated_at']

    def get_educational_team(self, obj):
        return obj.get_educational_team()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'created_at', 'updated_at']


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'created_at']


class ResourceAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceAttachment
        fields = ['id', 'resource', 'file', 'file_name', 'file_type', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class ResourceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceImage
        fields = ['id', 'resource', 'image', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class ResourceListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for lists/grids.
    """
    publisher_name = serializers.CharField(source='publisher.name', read_only=True)
    publisher_type = serializers.CharField(source='publisher.publisher_type', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    review_status = serializers.CharField(read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'short_summary', 'publisher', 'publisher_name', 
            'publisher_type', 'created_by', 'category', 'category_name', 'author_name', 'status', 
            'language', 'cover_image', 'is_featured', 'published_date', 
            'view_count', 'download_count', 'bookmark_count', 'review_status', 
            'created_at'
        ]


class ResourceDetailSerializer(serializers.ModelSerializer):
    publisher_name = serializers.CharField(source='publisher.name', read_only=True)
    publisher_type = serializers.CharField(source='publisher.publisher_type', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    related_crops = CropTypeSerializer(many=True, read_only=True)
    topics = TopicSerializer(many=True, read_only=True)
    attachments = ResourceAttachmentSerializer(many=True, read_only=True)
    gallery_images = ResourceImageSerializer(many=True, read_only=True)
    review_status = serializers.CharField(read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'short_summary', 'content', 'publisher', 
            'publisher_name', 'publisher_type', 'created_by', 'author_name', 
            'category', 'category_name', 'related_crops', 'topics', 'status', 
            'language', 'cover_image', 'external_video_url', 'uploaded_video',
            'is_featured', 'published_date', 'view_count', 'download_count', 
            'bookmark_count', 'next_review_date', 'last_reviewed_by', 
            'last_reviewed_at', 'review_status', 'attachments', 'gallery_images', 
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'publisher', 'created_by', 'view_count', 'download_count', 
            'bookmark_count', 'last_reviewed_by', 'last_reviewed_at', 
            'created_at', 'updated_at'
        ]


class ResourceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            'title', 'slug', 'short_summary', 'content', 'category',
            'related_crops', 'topics', 'status', 'language', 'cover_image',
            'external_video_url', 'uploaded_video', 'is_featured', 'next_review_date'
        ]
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'category': {'required': False, 'allow_null': True},
        }

    def validate(self, attrs):
        # Additional validation can be added here
        return attrs


class BookmarkSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'resource', 'resource_title', 'created_at']
        read_only_fields = ['created_at']


class RecentlyViewedSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    
    class Meta:
        model = RecentlyViewed
        fields = ['id', 'resource', 'resource_title', 'viewed_at']
        read_only_fields = ['viewed_at']


class ConsultationAttachedResourceSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)
    resource_slug = serializers.CharField(source='resource.slug', read_only=True)
    attached_by_name = serializers.CharField(source='attached_by.get_full_name', read_only=True)

    class Meta:
        model = ConsultationAttachedResource
        fields = [
            'id', 'consultation', 'message', 'resource', 'resource_title', 
            'resource_slug', 'attached_by', 'attached_by_name', 'attached_at'
        ]
        read_only_fields = ['attached_by', 'attached_at']


class WoredaEducationalManagerAssignmentSerializer(serializers.ModelSerializer):
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True)
    woreda_name = serializers.CharField(source='woreda.name', read_only=True, default=None)
    special_woreda_name = serializers.CharField(source='special_woreda.name', read_only=True, default=None)

    class Meta:
        model = WoredaEducationalManagerAssignment
        fields = [
            'id', 'officer', 'officer_name', 
            'woreda', 'woreda_name', 
            'special_woreda', 'special_woreda_name', 
            'assigned_at'
        ]
        read_only_fields = ['assigned_at']


class KebeleEducationalManagerAssignmentSerializer(serializers.ModelSerializer):
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True)
    kebele_name = serializers.CharField(source='kebele.name', read_only=True)

    class Meta:
        model = KebeleEducationalManagerAssignment
        fields = ['id', 'officer', 'officer_name', 'kebele', 'kebele_name', 'assigned_at']
        read_only_fields = ['assigned_at']

from administration.services import AuditService
from administration.models import ActionTypeChoices, ActionCategoryChoices
from notifications.services import NotificationService
from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from education.models import (
    PublisherProfile,
    Category,
    Topic,
    Resource,
    Bookmark,
    RecentlyViewed,
    ResourceStatusChoices,
    ConsultationAttachedResource,
    WoredaEducationalManagerAssignment,
    KebeleEducationalManagerAssignment
)
from education.serializers import (
    PublisherProfileSerializer,
    CategorySerializer,
    TopicSerializer,
    ResourceListSerializer,
    ResourceDetailSerializer,
    ResourceCreateUpdateSerializer,
    BookmarkSerializer,
    RecentlyViewedSerializer,
    ConsultationAttachedResourceSerializer,
    WoredaEducationalManagerAssignmentSerializer,
    KebeleEducationalManagerAssignmentSerializer
)
from education.permissions import (
    IsPublisherManagerOrAdmin,
    IsResourceAuthorOrAdmin,
    CanCreateEducationalContent
)
from accounts.permissions import IsAdministrator


class PublisherProfileListView(generics.ListAPIView):
    queryset = PublisherProfile.objects.all()
    serializer_class = PublisherProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['publisher_type']
    search_fields = ['name', 'woreda__name', 'kebele__name']


class PublisherProfileDetailView(generics.RetrieveUpdateAPIView):
    queryset = PublisherProfile.objects.all()
    serializer_class = PublisherProfileSerializer
    permission_classes = [IsPublisherManagerOrAdmin]


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsAdministrator()]
        return [IsAuthenticated()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdministrator()]
        return [IsAuthenticated()]


class TopicListCreateView(generics.ListCreateAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsAdministrator()]
        return [IsAuthenticated()]


class ResourceListView(generics.ListCreateAPIView):
    permission_classes = [CanCreateEducationalContent]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'language', 'status', 'is_featured', 'publisher__publisher_type']
    search_fields = ['title', 'short_summary', 'content', 'topics__name', 'related_crops__name']
    ordering_fields = ['created_at', 'view_count', 'download_count', 'bookmark_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ResourceCreateUpdateSerializer
        return ResourceListSerializer

    def get_queryset(self):
        user = self.request.user
        base_qs = Resource.objects.select_related('publisher', 'category', 'created_by').all()
        
        authored_only = self.request.query_params.get('authored_only')
        if authored_only in ['true', 'True', '1'] or self.request.query_params.get('created_by') == 'me':
            qs = base_qs.filter(created_by=user)
            if getattr(user, 'role', None) == 'OFFICER':
                # In officer workspace, strictly scope to Kebele level publisher
                kebele_assignment = KebeleEducationalManagerAssignment.objects.filter(officer=user).first()
                if kebele_assignment and hasattr(kebele_assignment.kebele, 'publisher_profile'):
                    qs = qs.filter(publisher=kebele_assignment.kebele.publisher_profile)
                elif hasattr(user, 'lead_officer_assignment') and user.lead_officer_assignment.exists():
                    lead = user.lead_officer_assignment.first()
                    if hasattr(lead.kebele, 'publisher_profile'):
                        qs = qs.filter(publisher=lead.kebele.publisher_profile)
                elif getattr(user, 'kebele_id', None) and hasattr(user.kebele, 'publisher_profile'):
                    qs = qs.filter(publisher=user.kebele.publisher_profile)
                else:
                    qs = qs.filter(publisher__publisher_type='KEBELE')
            return qs

        if user.role == 'ADMINISTRATOR':
            return base_qs
            
        public_qs = base_qs.filter(status=ResourceStatusChoices.PUBLISHED)
        authored_qs = base_qs.filter(created_by=user)
        
        return (public_qs | authored_qs).distinct()

    def perform_create(self, serializer):
        user = self.request.user
        publisher = None
        
        from education.models import WoredaEducationalManagerAssignment, KebeleEducationalManagerAssignment
        from accounts.models import LeadOfficerAssignment, RoleChoices
        
        if user.role == RoleChoices.ADMINISTRATOR:
            # Administrators default to their assigned location publisher if available, else the first Woreda
            if getattr(user, 'woreda_id', None) and hasattr(user.woreda, 'publisher_profile'):
                publisher = user.woreda.publisher_profile
            elif getattr(user, 'special_woreda_id', None) and hasattr(user.special_woreda, 'publisher_profile'):
                publisher = user.special_woreda.publisher_profile
            else:
                publisher = PublisherProfile.objects.filter(publisher_type='WOREDA').first()
        else:
            # 1. Check Kebele Educational Manager Assignment
            kebele_assignment = KebeleEducationalManagerAssignment.objects.filter(officer=user).first()
            if kebele_assignment and hasattr(kebele_assignment.kebele, 'publisher_profile'):
                publisher = kebele_assignment.kebele.publisher_profile
            
            # 2. Check Woreda Educational Manager Assignment
            if not publisher:
                woreda_assignment = WoredaEducationalManagerAssignment.objects.filter(officer=user).first()
                if woreda_assignment:
                    if woreda_assignment.woreda and hasattr(woreda_assignment.woreda, 'publisher_profile'):
                        publisher = woreda_assignment.woreda.publisher_profile
                    elif woreda_assignment.special_woreda and hasattr(woreda_assignment.special_woreda, 'publisher_profile'):
                        publisher = woreda_assignment.special_woreda.publisher_profile
            
            # 3. Check Lead Officer Assignment
            if not publisher:
                lead_assignment = LeadOfficerAssignment.objects.filter(officer=user).first()
                if lead_assignment and hasattr(lead_assignment.kebele, 'publisher_profile'):
                    publisher = lead_assignment.kebele.publisher_profile
                    
        # Fallback to pure location-based inference if no specific assignments match
        if not publisher:
            if getattr(user, 'kebele_id', None) and hasattr(user.kebele, 'publisher_profile'):
                publisher = user.kebele.publisher_profile
            elif getattr(user, 'woreda_id', None) and hasattr(user.woreda, 'publisher_profile'):
                publisher = user.woreda.publisher_profile
            elif getattr(user, 'special_woreda_id', None) and hasattr(user.special_woreda, 'publisher_profile'):
                publisher = user.special_woreda.publisher_profile
        
        if not publisher:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You must be assigned to a valid Woreda, Special Woreda, or Kebele with a publisher profile to create resources.")

        # Auto-generate slug if not provided
        slug = serializer.validated_data.get('slug')
        if not slug:
            from django.utils.text import slugify
            import uuid
            title = serializer.validated_data.get('title', 'resource')
            slug = f"{slugify(title)}-{uuid.uuid4().hex[:8]}"

        resource = serializer.save(created_by=user, publisher=publisher, slug=slug)

        if resource.status == 'PUBLISHED':
            from notifications.services import NotificationService
            from notifications.models import NotificationCategoryChoices, NotificationTypeChoices, NotificationRelatedObjectChoices
            
            title = f"New Educational Resource: {resource.title}"
            message = f"{publisher.name} has published a new educational resource."
            action_url = f"/education/resources/{resource.id}"
            
            if publisher.kebele_id:
                NotificationService.notify_kebele(
                    publisher.kebele_id, title, message, 
                    NotificationCategoryChoices.EDUCATION, roles=['FARMER', 'OFFICER'], action_url=action_url,
                    related_object_type=NotificationRelatedObjectChoices.RESOURCE, related_object_id=str(resource.id)
                )
            elif publisher.woreda_id:
                NotificationService.notify_woreda(
                    publisher.woreda_id, title, message, 
                    NotificationCategoryChoices.EDUCATION, roles=['FARMER', 'OFFICER'], action_url=action_url,
                    related_object_type=NotificationRelatedObjectChoices.RESOURCE, related_object_id=str(resource.id)
                )
            elif publisher.special_woreda_id:
                NotificationService.notify_woreda(
                    publisher.special_woreda_id, title, message, 
                    NotificationCategoryChoices.EDUCATION, roles=['FARMER', 'OFFICER'], action_url=action_url,
                    related_object_type=NotificationRelatedObjectChoices.RESOURCE, related_object_id=str(resource.id)
                )
                
            # Always notify all administrators when new educational content is published
            NotificationService.notify_admin(
                title, message, 
                NotificationCategoryChoices.EDUCATION, action_url=action_url,
                related_object_type=NotificationRelatedObjectChoices.RESOURCE, related_object_id=str(resource.id)
            )


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resource.objects.all()
    permission_classes = [IsResourceAuthorOrAdmin]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ResourceCreateUpdateSerializer
        return ResourceDetailSerializer
        
    def perform_update(self, serializer):
        original_status = self.get_object().status
        resource = serializer.save()
        
        # Notify if status changed to PUBLISHED
        if original_status != 'PUBLISHED' and resource.status == 'PUBLISHED':
            publisher = resource.publisher
            from notifications.services import NotificationService
            from notifications.models import NotificationCategoryChoices, NotificationTypeChoices, NotificationRelatedObjectChoices
            
            title = f"New Educational Resource: {resource.title}"
            message = f"{publisher.name} has published a new educational resource."
            action_url = f"/education/resources/{resource.id}"
            
            if getattr(publisher, 'kebele_id', None):
                NotificationService.notify_kebele(
                    publisher.kebele_id, title, message, 
                    NotificationCategoryChoices.EDUCATION, roles=['FARMER', 'OFFICER'], action_url=action_url,
                    related_object_type=NotificationRelatedObjectChoices.RESOURCE, related_object_id=str(resource.id)
                )
            elif getattr(publisher, 'woreda_id', None):
                NotificationService.notify_woreda(
                    publisher.woreda_id, title, message, 
                    NotificationCategoryChoices.EDUCATION, roles=['FARMER', 'OFFICER'], action_url=action_url,
                    related_object_type=NotificationRelatedObjectChoices.RESOURCE, related_object_id=str(resource.id)
                )
            elif getattr(publisher, 'special_woreda_id', None):
                NotificationService.notify_woreda(
                    publisher.special_woreda_id, title, message, 
                    NotificationCategoryChoices.EDUCATION, roles=['FARMER', 'OFFICER'], action_url=action_url,
                    related_object_type=NotificationRelatedObjectChoices.RESOURCE, related_object_id=str(resource.id)
                )
                
            # Always notify all administrators when new educational content is published
            NotificationService.notify_admin(
                title, message, 
                NotificationCategoryChoices.EDUCATION, action_url=action_url,
                related_object_type=NotificationRelatedObjectChoices.RESOURCE, related_object_id=str(resource.id)
            )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        from django.utils import timezone
        from datetime import timedelta
        
        recent, created = RecentlyViewed.objects.get_or_create(
            user=request.user,
            resource=instance,
            defaults={'viewed_at': timezone.now()}
        )
        
        if created or timezone.now() - recent.viewed_at > timedelta(hours=1):
            instance.view_count += 1
            instance.save(update_fields=['view_count'])
            if not created:
                recent.viewed_at = timezone.now()
                recent.save(update_fields=['viewed_at'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BookmarkToggleView(APIView):
    def post(self, request, pk):
        resource = generics.get_object_or_404(Resource, pk=pk)
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, resource=resource)
        
        if not created:
            bookmark.delete()
            resource.bookmark_count -= 1
            resource.save(update_fields=['bookmark_count'])
            return Response({'status': 'unbookmarked'})
            
        resource.bookmark_count += 1
        resource.save(update_fields=['bookmark_count'])
        return Response({'status': 'bookmarked'}, status=status.HTTP_201_CREATED)


class BookmarkedResourceListView(generics.ListAPIView):
    """
    List all resources bookmarked by the currently authenticated user.
    """
    serializer_class = ResourceListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resource.objects.filter(
            bookmarks__user=self.request.user
        ).select_related('publisher', 'category', 'created_by').order_by('-bookmarks__created_at')


class RecommendationView(generics.ListAPIView):
    serializer_class = ResourceListSerializer
    
    def get_queryset(self):
        topics = self.request.query_params.getlist('topics')
        if len(topics) == 1 and ',' in topics[0]:
            topics = topics[0].split(',')
            
        if not topics:
            return Resource.objects.none()
            
        return Resource.objects.filter(
            status=ResourceStatusChoices.PUBLISHED,
            topics__name__in=topics
        ).distinct()


class ConsultationAttachedResourceListCreateView(generics.ListCreateAPIView):
    """
    List attachments for a consultation or attach a new resource.
    """
    serializer_class = ConsultationAttachedResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['consultation', 'message']

    def get_queryset(self):
        return ConsultationAttachedResource.objects.select_related(
            'resource', 'attached_by'
        ).all()

    def perform_create(self, serializer):
        serializer.save(attached_by=self.request.user)


class WoredaEducationalManagerAssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = WoredaEducationalManagerAssignmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['woreda', 'special_woreda', 'officer']
    permission_classes = [IsAdministrator]

    def get_queryset(self):
        return WoredaEducationalManagerAssignment.objects.select_related('officer', 'woreda', 'special_woreda', 'assigned_by').all()

    def perform_create(self, serializer):
        assignment = serializer.save(assigned_by=self.request.user)
        target_name = assignment.woreda.name if assignment.woreda else assignment.special_woreda.name
        AuditService.log(
            action=ActionTypeChoices.EDUCATIONAL_MANAGER_ASSIGNED,
            description=f"Assigned {assignment.officer.get_full_name()} as Educational Manager for {target_name}",
            actor=self.request.user,
            target_type='WoredaEducationalManagerAssignment',
            target_id=assignment.id,
            target_repr=f"{assignment.officer.get_full_name()} -> {target_name}",
            request=self.request,
            woreda=assignment.woreda,
            special_woreda=assignment.special_woreda
        )
        NotificationService.notify_user(
            recipient=assignment.officer,
            title='Educational Manager Appointment',
            message=f"You have been designated as the Woreda Educational System Manager for {target_name}.",
            category='ASSIGNMENT'
        )


class WoredaEducationalManagerAssignmentDetailView(generics.RetrieveDestroyAPIView):
    queryset = WoredaEducationalManagerAssignment.objects.all()
    serializer_class = WoredaEducationalManagerAssignmentSerializer
    permission_classes = [IsAdministrator]

    def perform_destroy(self, instance):
        loc_name = instance.woreda.name if instance.woreda else (instance.special_woreda.name if instance.special_woreda else "Woreda Scope")
        AuditService.log(
            action=ActionTypeChoices.EDUCATIONAL_MANAGER_REMOVED,
            category=ActionCategoryChoices.ASSIGNMENT,
            description=f"Removed Woreda Educational Manager assignment for {instance.officer.get_full_name()} ({loc_name})",
            actor=self.request.user,
            target_type='WoredaEducationalManagerAssignment',
            target_id=instance.id,
            target_repr=f"{instance.officer.get_full_name()} -> {loc_name}",
            request=self.request,
            woreda=instance.woreda,
            special_woreda=instance.special_woreda
        )
        instance.delete()


class KebeleEducationalManagerAssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = KebeleEducationalManagerAssignmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['kebele', 'officer']
    
    def get_permissions(self):
        # Admins or Lead Officers of that kebele can manage these. 
        # For simplicity, since it's a critical action, we can ensure they are authenticated 
        # and validate the kebele permission in the serializer or view.
        # But we'll rely on IsAuthenticated here and standard Lead Officer checks if needed.
        return [IsAuthenticated()]

    def get_queryset(self):
        return KebeleEducationalManagerAssignment.objects.select_related('officer', 'kebele', 'assigned_by').all()

    def perform_create(self, serializer):
        assignment = serializer.save(assigned_by=self.request.user)
        AuditService.log(
            action=ActionTypeChoices.EDUCATIONAL_MANAGER_ASSIGNED,
            description=f"Assigned {assignment.officer.get_full_name()} as Kebele Educational Manager for {assignment.kebele.name}",
            actor=self.request.user,
            target_type='KebeleEducationalManagerAssignment',
            target_id=assignment.id,
            target_repr=f"{assignment.officer.get_full_name()} -> {assignment.kebele.name}",
            request=self.request,
            kebele=assignment.kebele
        )
        NotificationService.notify_user(
            recipient=assignment.officer,
            title='Educational Manager Appointment',
            message=f"You have been designated as the Kebele Educational System Manager for {assignment.kebele.name}.",
            category='ASSIGNMENT'
        )


class KebeleEducationalManagerAssignmentDetailView(generics.RetrieveDestroyAPIView):
    queryset = KebeleEducationalManagerAssignment.objects.all()
    serializer_class = KebeleEducationalManagerAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        AuditService.log(
            action=ActionTypeChoices.EDUCATIONAL_MANAGER_REMOVED,
            category=ActionCategoryChoices.ASSIGNMENT,
            description=f"Removed Kebele Educational Manager assignment for {instance.officer.get_full_name()} from {instance.kebele.name}",
            actor=self.request.user,
            target_type='KebeleEducationalManagerAssignment',
            target_id=instance.id,
            target_repr=f"{instance.officer.get_full_name()} -> {instance.kebele.name}",
            request=self.request,
            kebele=instance.kebele
        )
        instance.delete()


class MyEducationalManagerStatusView(APIView):
    """
    Checks if the authenticated officer is an active Educational Manager
    (either at the Kebele level or Woreda level).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        kebele_assignments = KebeleEducationalManagerAssignment.objects.filter(officer=user).select_related('kebele')
        woreda_assignments = WoredaEducationalManagerAssignment.objects.filter(officer=user).select_related('woreda', 'special_woreda')
        
        is_kebele_manager = kebele_assignments.exists()
        is_woreda_manager = woreda_assignments.exists()
        is_educational_manager = is_kebele_manager or is_woreda_manager
        
        return Response({
            'is_educational_manager': is_educational_manager,
            'is_kebele_manager': is_kebele_manager,
            'is_woreda_manager': is_woreda_manager,
            'kebele_assignments': [
                {'id': a.id, 'kebele_id': a.kebele.id, 'kebele_name': a.kebele.name, 'assigned_at': a.assigned_at}
                for a in kebele_assignments
            ],
            'woreda_assignments': [
                {
                    'id': a.id,
                    'woreda_id': a.woreda.id if a.woreda else None,
                    'woreda_name': a.woreda.name if a.woreda else None,
                    'special_woreda_id': a.special_woreda.id if a.special_woreda else None,
                    'special_woreda_name': a.special_woreda.name if a.special_woreda else None,
                    'assigned_at': a.assigned_at
                }
                for a in woreda_assignments
            ]
        })

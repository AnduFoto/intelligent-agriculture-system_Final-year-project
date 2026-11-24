from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, F, Max, Count, Subquery, OuterRef
from django.utils import timezone
from datetime import timedelta

from accounts.models import User, RoleChoices, StatusChoices
from locations.models import Kebele, Woreda, SpecialWoreda, Zone, Region
from chat.models import (
    Conversation,
    ConversationParticipant,
    Message,
    BlockedUser,
    ChatReport,
    ReportStatusChoices
)
from chat.serializers import (
    ConversationSerializer,
    MessageSerializer,
    UserMinimalSerializer,
    BlockedUserSerializer,
    ChatReportSerializer
)
from chat.services import ChatService
from chat.permissions import IsConversationParticipant, IsNotSuspended, IsChatAdmin


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class MessagePagination(PageNumberPagination):
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 100


class ConversationListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        # Base Queryset: Conversations user participates in
        queryset = Conversation.objects.filter(
            Q(user1=user) | Q(user2=user),
            is_active=True
        ).select_related('user1', 'user2').prefetch_related('participants', 'messages')

        # 1. Search filter (by recipient name or email)
        search_query = request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(user1__first_name__icontains=search_query) |
                Q(user1__middle_name__icontains=search_query) |
                Q(user1__last_name__icontains=search_query) |
                Q(user1__email__icontains=search_query) |
                Q(user2__first_name__icontains=search_query) |
                Q(user2__middle_name__icontains=search_query) |
                Q(user2__last_name__icontains=search_query) |
                Q(user2__email__icontains=search_query)
            )

        # 2. Role filter
        role = request.query_params.get('role', '').strip()
        if role and role in RoleChoices.values:
            queryset = queryset.filter(
                (Q(user1=user) & Q(user2__role=role)) |
                (Q(user2=user) & Q(user1__role=role))
            )

        # 3. Kebele filter
        kebele_id = request.query_params.get('kebele', '').strip()
        if kebele_id:
            try:
                k_id = int(kebele_id)
                queryset = queryset.filter(
                    (Q(user1=user) & (Q(user2__farmer_profile__kebele_id=k_id) | Q(user2__assigned_kebeles__id=k_id))) |
                    (Q(user2=user) & (Q(user1__farmer_profile__kebele_id=k_id) | Q(user1__assigned_kebeles__id=k_id)))
                ).distinct()
            except ValueError:
                pass

        # 4. Chat Type filter: all, new, old, unread
        chat_type = request.query_params.get('chat_type', 'all').strip().lower()
        if chat_type == 'unread':
            # Only conversations with unread messages for user
            part_subquery = ConversationParticipant.objects.filter(
                conversation=OuterRef('pk'),
                user=user
            ).values('last_read_at')[:1]
            queryset = queryset.annotate(
                user_last_read=Subquery(part_subquery)
            ).filter(
                messages__created_at__gt=F('user_last_read'),
                messages__is_deleted=False
            ).exclude(messages__sender=user).distinct()
        elif chat_type == 'new':
            # Conversations created/updated in the last 3 days
            three_days_ago = timezone.now() - timedelta(days=3)
            queryset = queryset.filter(updated_at__gte=three_days_ago)
        elif chat_type == 'old':
            three_days_ago = timezone.now() - timedelta(days=3)
            queryset = queryset.filter(updated_at__lt=three_days_ago)

        # 5. Sorting
        sort_order = request.query_params.get('sort', 'newest').strip().lower()
        if sort_order == 'oldest':
            queryset = queryset.order_by('updated_at')
        else:
            queryset = queryset.order_by('-updated_at')

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ConversationSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, *args, **kwargs):
        recipient_id = request.data.get('recipient_id')
        if not recipient_id:
            return Response({'detail': "recipient_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recipient = User.objects.get(pk=recipient_id)
        except User.DoesNotExist:
            return Response({'detail': "Recipient user not found."}, status=status.HTTP_404_NOT_FOUND)

        conv, created = ChatService.get_or_create_conversation(request.user, recipient)
        serializer = ConversationSerializer(conv, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsConversationParticipant]

    def get(self, request, pk, *args, **kwargs):
        try:
            conv = Conversation.objects.select_related('user1', 'user2').get(pk=pk)
        except Conversation.DoesNotExist:
            return Response({'detail': "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, conv)
        serializer = ConversationSerializer(conv, context={'request': request})
        return Response(serializer.data)


class ConversationMarkReadView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsConversationParticipant]

    def post(self, request, pk, *args, **kwargs):
        try:
            conv = Conversation.objects.get(pk=pk)
        except Conversation.DoesNotExist:
            return Response({'detail': "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, conv)
        ChatService.mark_as_read(request.user, pk)
        return Response({'status': 'read', 'last_read_at': timezone.now()})


class ConversationTypingView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsConversationParticipant]

    def post(self, request, pk, *args, **kwargs):
        try:
            conv = Conversation.objects.get(pk=pk)
        except Conversation.DoesNotExist:
            return Response({'detail': "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, conv)
        ChatService.update_typing_status(request.user, pk)
        return Response({'status': 'typing', 'last_typed_at': timezone.now()})


class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsConversationParticipant]

    def get(self, request, pk, *args, **kwargs):
        try:
            conv = Conversation.objects.get(pk=pk)
        except Conversation.DoesNotExist:
            return Response({'detail': "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, conv)

        queryset = Message.objects.filter(conversation=conv).select_related(
            'sender', 'reply_to', 'reply_to__sender'
        ).prefetch_related('reactions', 'favorited_by').order_by('created_at')

        # Auto mark as read when fetching messages
        ChatService.mark_as_read(request.user, pk)

        paginator = MessagePagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = MessageSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, pk, *args, **kwargs):
        try:
            conv = Conversation.objects.get(pk=pk)
        except Conversation.DoesNotExist:
            return Response({'detail': "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, conv)

        text = request.data.get('text', '')
        message_type = request.data.get('message_type', 'TEXT')
        media_file = request.FILES.get('media_file', None)
        reply_to_id = request.data.get('reply_to_id', None)
        file_name = request.data.get('file_name', '')

        message = ChatService.send_message(
            sender=request.user,
            conversation_id=pk,
            text=text,
            message_type=message_type,
            media_file=media_file,
            reply_to_id=reply_to_id,
            file_name=file_name,
            request=request
        )

        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageDetailView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def patch(self, request, pk, *args, **kwargs):
        new_text = request.data.get('text', '')
        if not new_text:
            return Response({'detail': "New text is required."}, status=status.HTTP_400_BAD_REQUEST)

        msg = ChatService.edit_message(request.user, pk, new_text)
        serializer = MessageSerializer(msg, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk, *args, **kwargs):
        msg = ChatService.delete_message(request.user, pk)
        serializer = MessageSerializer(msg, context={'request': request})
        return Response(serializer.data)


class MessageReactionView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, pk, *args, **kwargs):
        emoji = request.data.get('emoji', '').upper()
        res = ChatService.toggle_reaction(request.user, pk, emoji)
        return Response(res, status=status.HTTP_200_OK)


class MessageFavoriteView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, pk, *args, **kwargs):
        res = ChatService.toggle_favorite(request.user, pk)
        return Response(res, status=status.HTTP_200_OK)


class FavoriteMessagesListView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def get(self, request, *args, **kwargs):
        conversation_id = request.query_params.get('conversation_id', None)
        from chat.models import FavoriteMessage
        fav_qs = FavoriteMessage.objects.filter(user=request.user).select_related('message')
        if conversation_id:
            fav_qs = fav_qs.filter(message__conversation_id=conversation_id)

        messages = [f.message for f in fav_qs if not f.message.is_deleted]
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)


class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        unread_count = ChatService.get_unread_count(request.user)
        return Response({'unread_count': unread_count})


class UserChatSearchView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def get(self, request, *args, **kwargs):
        user = request.user
        queryset = User.objects.exclude(pk=user.id).filter(is_active=True, status=StatusChoices.ACTIVE)

        search_query = request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(middle_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(email__icontains=search_query)
            )

        role = request.query_params.get('role', '').strip()
        if role and role in RoleChoices.values:
            queryset = queryset.filter(role=role)

        # Location Filters
        kebele_id = request.query_params.get('kebele', '').strip()
        woreda_id = request.query_params.get('woreda', '').strip()
        special_woreda_id = request.query_params.get('special_woreda', '').strip()

        if kebele_id:
            try:
                k_id = int(kebele_id)
                queryset = queryset.filter(
                    Q(farmer_profile__kebele_id=k_id) | Q(assigned_kebeles__id=k_id)
                ).distinct()
            except ValueError:
                pass
        elif woreda_id:
            try:
                w_id = int(woreda_id)
                queryset = queryset.filter(
                    Q(farmer_profile__kebele__woreda_id=w_id) | Q(assigned_kebeles__woreda_id=w_id)
                ).distinct()
            except ValueError:
                pass
        elif special_woreda_id:
            try:
                sw_id = int(special_woreda_id)
                queryset = queryset.filter(
                    Q(farmer_profile__kebele__special_woreda_id=sw_id) | Q(assigned_kebeles__special_woreda_id=sw_id)
                ).distinct()
            except ValueError:
                pass

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = UserMinimalSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class UserBlockToggleView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, pk, *args, **kwargs):
        blocked = ChatService.block_user(request.user, pk, request=request)
        serializer = BlockedUserSerializer(blocked, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk, *args, **kwargs):
        ChatService.unblock_user(request.user, pk, request=request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BlockedUserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BlockedUserSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return BlockedUser.objects.filter(blocker=self.request.user).select_related('blocked_user')


class ChatReportListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, *args, **kwargs):
        conversation_id = request.data.get('conversation_id')
        message_id = request.data.get('message_id', None)
        reason = request.data.get('reason', 'OTHER')
        description = request.data.get('description', '')

        report = ChatService.report_chat(
            reporter=request.user,
            conversation_id=conversation_id,
            message_id=message_id,
            reason=reason,
            description=description,
            request=request
        )
        serializer = ChatReportSerializer(report, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        if not request.user.role == RoleChoices.ADMINISTRATOR:
            return Response({'detail': "Administrator permission required."}, status=status.HTTP_403_FORBIDDEN)

        queryset = ChatReport.objects.select_related('reporter', 'reported_user', 'conversation', 'message', 'reviewed_by').all()

        report_status = request.query_params.get('status', '').strip()
        if report_status in ReportStatusChoices.values:
            queryset = queryset.filter(status=report_status)

        reason = request.query_params.get('reason', '').strip()
        if reason:
            queryset = queryset.filter(reason=reason)

        search_query = request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(reporter__first_name__icontains=search_query) |
                Q(reporter__last_name__icontains=search_query) |
                Q(reported_user__first_name__icontains=search_query) |
                Q(reported_user__last_name__icontains=search_query)
            )

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = ChatReportSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class AdminChatReportDetailView(APIView):
    permission_classes = [IsAuthenticated, IsChatAdmin]

    def patch(self, request, pk, *args, **kwargs):
        report_status = request.data.get('status', ReportStatusChoices.RESOLVED)
        admin_note = request.data.get('admin_note', '')
        action_taken = request.data.get('action_taken', None) # 'DISMISS' | 'WARN' | 'SUSPEND'

        report = ChatService.resolve_report(
            admin_user=request.user,
            report_id=pk,
            status=report_status,
            admin_note=admin_note,
            action_taken=action_taken,
            request=request
        )
        serializer = ChatReportSerializer(report, context={'request': request})
        return Response(serializer.data)


class AdminChatStatsView(APIView):
    permission_classes = [IsAuthenticated, IsChatAdmin]

    def get(self, request, *args, **kwargs):
        today = timezone.now().date()
        stats = {
            'total_conversations': Conversation.objects.count(),
            'active_conversations': Conversation.objects.filter(is_active=True).count(),
            'messages_today': Message.objects.filter(created_at__date=today).count(),
            'pending_reports': ChatReport.objects.filter(status=ReportStatusChoices.PENDING).count(),
            'blocked_relationships': BlockedUser.objects.count(),
            'suspended_users': User.objects.filter(status=StatusChoices.SUSPENDED).count()
        }
        return Response(stats)

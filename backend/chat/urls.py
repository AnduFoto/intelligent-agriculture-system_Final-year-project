from django.urls import path
from chat.views import (
    ConversationListCreateView,
    ConversationDetailView,
    ConversationMarkReadView,
    ConversationTypingView,
    MessageListCreateView,
    MessageDetailView,
    MessageReactionView,
    MessageFavoriteView,
    FavoriteMessagesListView,
    UnreadCountView,
    UserChatSearchView,
    UserBlockToggleView,
    BlockedUserListView,
    ChatReportListCreateView,
    AdminChatReportDetailView,
    AdminChatStatsView
)

app_name = 'chat'

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list-create'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:pk>/read/', ConversationMarkReadView.as_view(), name='conversation-read'),
    path('conversations/<int:pk>/typing/', ConversationTypingView.as_view(), name='conversation-typing'),
    path('conversations/<int:pk>/messages/', MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/', MessageDetailView.as_view(), name='message-detail'),
    path('messages/<int:pk>/react/', MessageReactionView.as_view(), name='message-react'),
    path('messages/<int:pk>/favorite/', MessageFavoriteView.as_view(), name='message-favorite'),
    path('favorites/', FavoriteMessagesListView.as_view(), name='favorites-list'),
    
    path('unread-count/', UnreadCountView.as_view(), name='unread-count'),
    path('users/search/', UserChatSearchView.as_view(), name='user-search'),
    path('users/<int:pk>/block/', UserBlockToggleView.as_view(), name='user-block-toggle'),
    path('blocked/', BlockedUserListView.as_view(), name='blocked-list'),
    
    path('reports/', ChatReportListCreateView.as_view(), name='report-list-create'),
    path('reports/<int:pk>/', AdminChatReportDetailView.as_view(), name='report-detail'),
    path('admin/stats/', AdminChatStatsView.as_view(), name='admin-stats'),
]

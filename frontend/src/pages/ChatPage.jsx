import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { NewChatModal } from '../components/chat/NewChatModal';
import { UserProfilePreview } from '../components/chat/UserProfilePreview';
import { ReportChatModal } from '../components/chat/ReportChatModal';
import { BlockUserModal } from '../components/chat/BlockUserModal';
import { useChatContext } from '../context/ChatContext';
import chatService from '../api/chatService';
import { useTranslation } from 'react-i18next';
import { message as antMessage } from 'antd';

export default function ChatPage() {
  const { t } = useTranslation();
  const { refreshUnreadCount } = useChatContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Conversations State
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  // Filters State (Search | Role | Kebele | Chat Type | Sort)
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    kebele: '',
    chat_type: 'all',
    sort: 'newest'
  });

  // Active Conversation Messages State
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Modals & Drawers State
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportTargetMessage, setReportTargetMessage] = useState(null);

  // Mobile View State ('LIST' | 'CHAT')
  const [mobileView, setMobileView] = useState('LIST');

  const activePollingRef = useRef(null);

  // Initial Load Conversations & Handle URL query param ?conversation=ID
  useEffect(() => {
    loadConversations();
    const convParam = searchParams.get('conversation');
    if (convParam) {
      const convId = parseInt(convParam);
      setSelectedConversationId(convId);
      setMobileView('CHAT');
    }
  }, [filters]);

  // Load Conversations List
  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      const data = await chatService.getConversations(filters);
      const list = data.results || data || [];
      setConversations(list);

      // Select first conversation if none selected and not on mobile
      if (!selectedConversationId && list.length > 0 && window.innerWidth >= 768) {
        setSelectedConversationId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Poll Active Conversation Messages every 6 seconds
  const fetchActiveConversationData = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const [convData, msgData] = await Promise.all([
        chatService.getConversationDetail(convId),
        chatService.getMessages(convId)
      ]);
      setActiveConversation(convData);
      setMessages(msgData.results || msgData || []);
      setIsTyping(convData.is_typing || false);
      refreshUnreadCount();
    } catch (err) {
      console.error('Failed to fetch active conversation detail', err);
    }
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!selectedConversationId) return;

    setMessagesLoading(true);
    fetchActiveConversationData(selectedConversationId).finally(() => setMessagesLoading(false));

    // 6-second HTTP polling for open active conversation
    if (activePollingRef.current) clearInterval(activePollingRef.current);
    activePollingRef.current = setInterval(() => {
      fetchActiveConversationData(selectedConversationId);
    }, 6000);

    return () => {
      if (activePollingRef.current) clearInterval(activePollingRef.current);
    };
  }, [selectedConversationId, fetchActiveConversationData]);

  // Handle Filter Change
  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  // Handle Selecting Conversation
  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setSearchParams({ conversation: id });
    setMobileView('CHAT');
  };

  // Handle Starting New Chat
  const handleStartChat = async (recipientId) => {
    try {
      const conv = await chatService.getOrCreateConversation(recipientId);
      await loadConversations();
      handleSelectConversation(conv.id);
    } catch (err) {
      console.error('Failed to create chat', err);
      antMessage.error(t('failed_start_chat', 'Failed to start conversation.'));
    }
  };

  // Send Message Handler
  const handleSendMessage = async (messagePayload) => {
    if (!selectedConversationId) return;
    try {
      const newMsg = await chatService.sendMessage(selectedConversationId, messagePayload);
      setMessages(prev => [...prev, newMsg]);
      setReplyingTo(null);
      loadConversations();
    } catch (err) {
      console.error('Failed to send message', err);
      antMessage.error(err.response?.data?.detail || t('send_failed', 'Failed to send message.'));
    }
  };

  // Message Actions
  const handleEditMessage = async (msg) => {
    const newText = prompt(t('edit_message_prompt', 'Edit text message:'), msg.text);
    if (newText && newText.trim() && newText !== msg.text) {
      try {
        const updated = await chatService.editMessage(msg.id, newText.trim());
        setMessages(prev => prev.map(m => m.id === msg.id ? updated : m));
      } catch (err) {
        antMessage.error(t('edit_failed', 'Failed to edit message.'));
      }
    }
  };

  const handleDeleteMessage = async (msg) => {
    if (confirm(t('confirm_delete_message', 'Are you sure you want to delete this message?'))) {
      try {
        const deleted = await chatService.deleteMessage(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? deleted : m));
      } catch (err) {
        antMessage.error(t('delete_failed', 'Failed to delete message.'));
      }
    }
  };

  // Toggle Reaction Handler
  const handleToggleReaction = async (messageId, emoji) => {
    try {
      const res = await chatService.toggleReaction(messageId, emoji);
      setMessages(prev => prev.map(m => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || [];
        let updatedReactions = [...currentReactions];

        if (res.action === 'added') {
          const existing = updatedReactions.find(r => r.emoji === emoji);
          if (existing) {
            existing.count += 1;
            existing.user_reacted = true;
          } else {
            updatedReactions.push({ emoji, count: 1, user_reacted: true });
          }
        } else if (res.action === 'removed') {
          updatedReactions = updatedReactions
            .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, user_reacted: false } : r)
            .filter(r => r.count > 0);
        }
        return { ...m, reactions: updatedReactions };
      }));
    } catch (err) {
      console.error('Failed to toggle reaction', err);
      antMessage.error(t('reaction_failed', 'Failed to update reaction.'));
    }
  };

  // Toggle Favorite Handler
  const handleToggleFavorite = async (msg) => {
    try {
      const res = await chatService.toggleFavorite(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_favorite: res.is_favorite } : m));
      antMessage.success(res.is_favorite ? t('message_favorited', 'Message favorited.') : t('message_unfavorited', 'Message removed from favorites.'));
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      antMessage.error(t('favorite_failed', 'Failed to update favorite status.'));
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col w-full bg-slate-100 dark:bg-zinc-950 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-zinc-800 transition-colors">
      
      <div className="flex-1 flex min-h-0 w-full">
        
        {/* Left Column: Conversation List (Visible on desktop or when mobileView === 'LIST') */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 h-full ${
          mobileView === 'CHAT' ? 'hidden md:block' : 'block'
        }`}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onOpenNewChatModal={() => setNewChatModalOpen(true)}
            loading={conversationsLoading}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Right Column: Active Conversation Stream (Visible on desktop or when mobileView === 'CHAT') */}
        <div className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 ${
          mobileView === 'LIST' ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConversation ? (
            <>
              {/* Conversation Header */}
              <ChatHeader
                conversation={activeConversation}
                onBack={() => setMobileView('LIST')}
                onOpenProfile={() => setProfileDrawerOpen(true)}
                onBlockToggle={() => setBlockModalOpen(true)}
                onReport={() => {
                  setReportTargetMessage(null);
                  setReportModalOpen(true);
                }}
              />

              {/* Message History Stream */}
              <MessageList
                messages={messages}
                loading={messagesLoading}
                isTyping={isTyping}
                otherUser={activeConversation.other_user}
                onReply={(msg) => setReplyingTo(msg)}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReport={(msg) => {
                  setReportTargetMessage(msg);
                  setReportModalOpen(true);
                }}
                onToggleReaction={handleToggleReaction}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* Message Input Toolbar */}
              <MessageInput
                conversationId={selectedConversationId}
                onSendMessage={handleSendMessage}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                isDisabled={activeConversation.is_blocked}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 p-8 text-center">
              <span className="text-6xl mb-3">💬</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                {t('welcome_to_chat', 'System-Wide Private Messaging')}
              </h3>
              <p className="text-sm max-w-sm mt-1">
                {t('select_conversation_hint', 'Select a conversation from the left or click New Chat to start communicating.')}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Modals & Drawers */}
      <NewChatModal
        open={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onStartChat={handleStartChat}
      />

      <UserProfilePreview
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        user={activeConversation?.other_user}
      />

      <ReportChatModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        conversationId={selectedConversationId}
        messageToReport={reportTargetMessage}
      />

      <BlockUserModal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        targetUser={activeConversation?.other_user}
        isBlocked={activeConversation?.is_blocked}
        onSuccess={() => {
          fetchActiveConversationData(selectedConversationId);
          loadConversations();
        }}
      />

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Spin, Empty } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { ConversationListItem } from './ConversationListItem';
import { useTranslation } from 'react-i18next';
import locationService from '../../api/locationService';

export const ConversationList = ({
  conversations,
  selectedId,
  onSelectConversation,
  onOpenNewChatModal,
  loading,
  filters,
  onFilterChange
}) => {
  const { t } = useTranslation();
  const [kebeles, setKebeles] = useState([]);
  const [kebeleLoading, setKebeleLoading] = useState(false);

  useEffect(() => {
    loadKebeles();
  }, []);

  const loadKebeles = async () => {
    setKebeleLoading(true);
    try {
      const data = await locationService.getKebeles({ limit: 100 });
      setKebeles(data.results || data || []);
    } catch (err) {
      console.error('Failed to load kebeles for filter', err);
    } finally {
      setKebeleLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 rounded-l-2xl transition-colors">
      
      {/* Header & New Chat Button */}
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {t('chat', 'Chat')}
          </h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm"
            onClick={onOpenNewChatModal}
          >
            {t('new_chat', 'New Chat')}
          </Button>
        </div>

        {/* Filter Toolbar: Search | Role | Kebele | Chat Type | Sort */}
        <div className="space-y-2">
          
          {/* Search Bar */}
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder={t('search_users_placeholder', 'Search users...')}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            allowClear
            className="rounded-xl border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
          />

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 text-xs">
            
            {/* Role Filter */}
            <Select
              value={filters.role || ''}
              onChange={(val) => onFilterChange('role', val)}
              className="w-full"
              size="small"
              options={[
                { value: '', label: t('all_roles', 'All Roles') },
                { value: 'FARMER', label: t('farmers', 'Farmers') },
                { value: 'OFFICER', label: t('officers', 'Officers') },
                { value: 'ADMINISTRATOR', label: t('administrators', 'Administrators') }
              ]}
            />

            {/* Kebele Filter */}
            <Select
              value={filters.kebele || ''}
              onChange={(val) => onFilterChange('kebele', val)}
              className="w-full"
              size="small"
              loading={kebeleLoading}
              options={[
                { value: '', label: t('all_kebeles', 'All Kebeles') },
                ...kebeles.map(k => ({ value: k.id.toString(), label: k.name }))
              ]}
            />

            {/* Chat Type Filter */}
            <Select
              value={filters.chat_type || 'all'}
              onChange={(val) => onFilterChange('chat_type', val)}
              className="w-full"
              size="small"
              options={[
                { value: 'all', label: t('chat_type_all', 'All Chats') },
                { value: 'unread', label: t('chat_type_unread', 'New/Unread') },
                { value: 'new', label: t('chat_type_recent', 'Recent (3 Days)') },
                { value: 'old', label: t('chat_type_older', 'Older') }
              ]}
            />

            {/* Sort Order Filter */}
            <Select
              value={filters.sort || 'newest'}
              onChange={(val) => onFilterChange('sort', val)}
              className="w-full"
              size="small"
              options={[
                { value: 'newest', label: t('newest_first', 'Newest first') },
                { value: 'oldest', label: t('oldest_first', 'Oldest first') }
              ]}
            />

          </div>
        </div>

      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex justify-center p-8">
            <Spin />
          </div>
        ) : conversations.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-slate-400 text-xs">{t('no_conversations_found', 'No conversations found')}</span>}
            className="my-8"
          />
        ) : (
          conversations.map((conv) => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedId === conv.id}
              onClick={() => onSelectConversation(conv.id)}
            />
          ))
        )}
      </div>

    </div>
  );
};

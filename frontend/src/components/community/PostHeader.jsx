import React from 'react';
import { Dropdown } from 'antd';
import { MoreVertical, Edit2, Trash2, Flag, MapPin, Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PostHeader = ({ post, user, onEdit, onDelete, onReport }) => {
  const { t } = useTranslation();
  const author = post.author || {};
  const isOwner = post.is_owner || (user && author.id === user.id);
  const isAdmin = user?.role === 'ADMINISTRATOR';

  const menuItems = [];
  if (isOwner || isAdmin) {
    menuItems.push(
      {
        key: 'edit',
        icon: <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />,
        label: t('community.edit', 'Edit Post'),
        onClick: () => onEdit(post),
      },
      {
        key: 'delete',
        danger: true,
        icon: <Trash2 className="w-4 h-4 text-red-500" />,
        label: t('community.delete', 'Delete Post'),
        onClick: () => onDelete(post),
      }
    );
  } else {
    menuItems.push({
      key: 'report',
      icon: <Flag className="w-4 h-4 text-amber-500" />,
      label: t('community.report', 'Report Content'),
      onClick: () => onReport(post),
    });
  }

  // Format timestamp safely
  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const roleColorMap = {
    FARMER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    OFFICER: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    ADMINISTRATOR: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  return (
    <div className="flex items-start justify-between p-4 pb-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          {author.profile_image_url || author.profile_image ? (
            <img
              src={author.profile_image_url || author.profile_image}
              alt={author.full_name || 'User'}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
              {author.first_name ? author.first_name[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 dark:text-white text-sm hover:underline cursor-pointer">
              {author.full_name || `${author.first_name || ''} ${author.last_name || ''}`}
            </span>
            
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleColorMap[author.role] || 'bg-slate-100 text-slate-700'}`}>
              {author.role}
            </span>

            {post.crop_name && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Sprout className="w-3 h-3 text-amber-500" />
                {post.crop_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {post.location_summary && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {post.location_summary}
              </span>
            )}
            {post.location_summary && <span>•</span>}
            <span>{formattedDate}</span>
            {post.is_edited && <span className="italic">({t('community.edited', 'edited')})</span>}
          </div>
        </div>
      </div>

      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </Dropdown>
    </div>
  );
};

export default PostHeader;

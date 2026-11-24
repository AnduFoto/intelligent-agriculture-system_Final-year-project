import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import Badge from '../ui/Badge';

export default function ProfileHeader({ profile, onEditClick }) {
    const { t } = useTranslation();

    if (!profile) return null;

    const getStatusColor = (status) => {
        switch(status) {
            case 'ACTIVE': return 'success';
            case 'SUSPENDED': return 'error';
            case 'PENDING_VERIFICATION': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-slate-200 dark:border-zinc-700">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 border-4 border-slate-100 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-700 flex items-center justify-center">
                {profile.profile_image ? (
                    <img 
                        src={profile.profile_image} 
                        alt={profile.full_name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <UserOutlined className="text-4xl text-slate-400 dark:text-zinc-500" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    {profile.full_name}
                </h1>
                <div className="text-slate-500 dark:text-slate-400 mb-3">{profile.email}</div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <Badge variant="primary">{t(profile.role.toLowerCase(), profile.role)}</Badge>
                    <Badge variant={getStatusColor(profile.status)}>{t(profile.status.toLowerCase(), profile.status)}</Badge>
                </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 mt-4 sm:mt-0">
                <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={onEditClick}
                    className="bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                >
                    {t('edit_profile', 'Edit Profile')}
                </Button>
            </div>
        </div>
    );
}

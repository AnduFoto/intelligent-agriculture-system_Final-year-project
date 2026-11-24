import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function RoleInformationCard({ profile }) {
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
        <Card title={t('role_information', 'Role Information')} className="h-full">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('current_role', 'Current Role')}</span>
                    <div>
                        <Badge variant="primary">{t(profile.role.toLowerCase(), profile.role)}</Badge>
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('account_status', 'Account Status')}</span>
                    <div>
                        <Badge variant={getStatusColor(profile.status)}>{t(profile.status.toLowerCase(), profile.status)}</Badge>
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('account_date', 'Account Date')}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {new Date(profile.date_joined).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </Card>
    );
}

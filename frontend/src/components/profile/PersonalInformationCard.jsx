import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';

export default function PersonalInformationCard({ profile }) {
    const { t } = useTranslation();

    if (!profile) return null;

    const items = [
        { label: t('first_name', 'First Name'), value: profile.first_name },
        { label: t('middle_name', 'Middle Name'), value: profile.middle_name || '-' },
        { label: t('last_name', 'Last Name'), value: profile.last_name },
        { label: t('phone_number', 'Phone Number'), value: profile.phone_number },
        { label: t('language_preference', 'Language Preference'), value: profile.language_preference === 'EN' ? 'English' : 'አማርኛ' },
        { label: t('date_joined', 'Date Joined'), value: new Date(profile.date_joined).toLocaleDateString() },
    ];

    return (
        <Card title={t('personal_information', 'Personal Information')} className="h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{item.label}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{item.value}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

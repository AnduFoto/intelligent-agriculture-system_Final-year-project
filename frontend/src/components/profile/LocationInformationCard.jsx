import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';

export default function LocationInformationCard({ profile }) {
    const { t } = useTranslation();

    if (!profile) return null;
    
    // For officers, location comes from assignments.
    if (profile.role === 'OFFICER') {
        return null;
    }

    const { region_name, zone_name, woreda_name, special_woreda_name, kebele_name } = profile;
    
    // If no region, then probably no location set (e.g. newly created user without location)
    if (!region_name) {
        return (
            <Card title={t('location_information', 'Location Information')} className="h-full">
                <div className="text-slate-500 dark:text-slate-400">
                    {t('no_location_set', 'No location set.')}
                </div>
            </Card>
        );
    }

    // Determine XOR path
    const isSpecial = !!special_woreda_name;

    return (
        <Card title={t('location_information', 'Location Information')} className="h-full">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('region', 'Region')}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{region_name}</span>
                </div>

                {isSpecial ? (
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('special_woreda', 'Special Woreda')}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{special_woreda_name}</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {zone_name && (
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('zone', 'Zone')}</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{zone_name}</span>
                            </div>
                        )}
                        {woreda_name && (
                            <div className="flex flex-col">
                                <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('woreda', 'Woreda')}</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{woreda_name}</span>
                            </div>
                        )}
                    </div>
                )}

                {kebele_name && (
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('kebele', 'Kebele')}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{kebele_name}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';

export default function ManagementInformationCard({ profile }) {
    const { t } = useTranslation();

    const info = profile?.management_information;
    if (!info || Object.keys(info).length === 0) return null;

    return (
        <Card title={t('management_information', 'Management Information')} className="h-full">
            <div className="flex flex-col gap-6">
                
                {info.lead_officer && (
                    <div className="flex flex-col gap-2 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-400">
                            {t('lead_officer', 'Lead Officer')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('managed_kebele', 'Managed Kebele')}:</span> {info.lead_officer.kebele}</div>
                            {info.lead_officer.special_woreda ? (
                                <>
                                    <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('special_woreda', 'Special Woreda')}:</span> {info.lead_officer.special_woreda}</div>
                                </>
                            ) : (
                                <>
                                    <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('woreda', 'Woreda')}:</span> {info.lead_officer.woreda}</div>
                                    <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('zone', 'Zone')}:</span> {info.lead_officer.zone}</div>
                                </>
                            )}
                            <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('region', 'Region')}:</span> {info.lead_officer.region}</div>
                        </div>
                    </div>
                )}

                {info.woreda_education_manager && (
                    <div className="flex flex-col gap-2 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30">
                        <h4 className="font-bold text-orange-800 dark:text-orange-400">
                            {t('woreda_educational_management', 'Woreda Educational Management')}
                        </h4>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('woreda', 'Woreda')}:</span> {info.woreda_education_manager.woreda}</div>
                            {info.woreda_education_manager.publisher && (
                                <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('publisher', 'Publisher')}:</span> {info.woreda_education_manager.publisher}</div>
                            )}
                        </div>
                    </div>
                )}

                {info.kebele_education_manager && (
                    <div className="flex flex-col gap-2 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30">
                        <h4 className="font-bold text-orange-800 dark:text-orange-400">
                            {t('kebele_educational_management', 'Kebele Educational Management')}
                        </h4>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('kebele', 'Kebele')}:</span> {info.kebele_education_manager.kebele}</div>
                            {info.kebele_education_manager.woreda && (
                                <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('woreda', 'Woreda')}:</span> {info.kebele_education_manager.woreda}</div>
                            )}
                            {info.kebele_education_manager.publisher && (
                                <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('publisher', 'Publisher')}:</span> {info.kebele_education_manager.publisher}</div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </Card>
    );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';

export default function AssignmentInformationCard({ profile }) {
    const { t } = useTranslation();

    if (!profile || profile.role !== 'OFFICER') return null;

    const assignments = profile.assignments || [];

    return (
        <Card title={t('assignment_information', 'Assignment Information')} className="h-full">
            <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('assigned_kebeles', 'Assigned Kebeles')}
                </h4>
                {assignments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {assignments.map((assignment, index) => (
                            <div key={index} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                <h5 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">
                                    {assignment.kebele?.name}
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    {assignment.special_woreda ? (
                                        <>
                                            <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('special_woreda', 'Special Woreda')}:</span> {assignment.special_woreda.name}</div>
                                            <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('region', 'Region')}:</span> {assignment.region?.name}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('woreda', 'Woreda')}:</span> {assignment.woreda?.name}</div>
                                            <div><span className="font-medium text-slate-700 dark:text-slate-300">{t('zone', 'Zone')}:</span> {assignment.zone?.name}</div>
                                            <div className="sm:col-span-2"><span className="font-medium text-slate-700 dark:text-slate-300">{t('region', 'Region')}:</span> {assignment.region?.name}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-slate-500 dark:text-slate-400 italic">
                        {t('no_officer_assignments', 'No officer assignments.')}
                    </div>
                )}
            </div>
        </Card>
    );
}

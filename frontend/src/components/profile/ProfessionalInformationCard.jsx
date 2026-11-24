import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';

export default function ProfessionalInformationCard({ profile }) {
    const { t } = useTranslation();

    if (!profile || profile.role !== 'OFFICER') return null;

    const specs = profile.professional_information || [];

    return (
        <Card title={t('professional_information', 'Professional Information')} className="h-full">
            <div className="flex flex-col gap-4">
                {specs.length > 0 ? (
                    specs.map(spec => (
                        <div key={spec.id} className="p-4 bg-slate-50 dark:bg-zinc-700/50 rounded-lg border border-slate-100 dark:border-zinc-700">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{spec.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{spec.description}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-slate-500 dark:text-slate-400 italic">
                        {t('no_specialization_assigned', 'No specialization assigned.')}
                    </div>
                )}
            </div>
        </Card>
    );
}

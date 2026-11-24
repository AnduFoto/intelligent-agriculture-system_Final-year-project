import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { predictionService } from '../../api/predictionService';
import { PredictionResult } from './DiseaseDetectionPage';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';

export default function PredictionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    predictionService
      .getHistoryDetail(id)
      .then((response) => setResult(response.data))
      .catch(() => setError(t('could_not_load_prediction_record', 'Could not load this prediction record.')))
      .finally(() => setIsLoading(false));
  }, [id, t]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* NAVIGATION & HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <button 
            onClick={() => navigate('/farmer/predictions')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl w-fit mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back_to_history', 'Back to History')}
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('diagnosis_detail', 'Diagnosis Detail')}
          </h1>
          {result?.created_at && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              {t('analyzed_on', 'Analyzed on')} {new Date(result.created_at).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          )}
        </div>

        <Link
          to="/farmer/predict"
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          {t('new_scan', 'New Scan')}
        </Link>
      </div>

      <Card className="p-6 sm:p-8 shadow-md border-primary-100 dark:border-primary-500/20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('loading_record', 'Loading prediction record...')}</p>
          </div>
        ) : error ? (
          <Alert variant="error" className="my-8">{error}</Alert>
        ) : (
          <PredictionResult result={result} onAnalyzeAnother={() => navigate('/farmer/predict')} />
        )}
      </Card>
    </div>
  );
}
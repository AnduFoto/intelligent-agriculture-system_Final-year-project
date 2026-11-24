import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import consultationService from '../../api/consultationService';
import LoadingSpinner from '../ui/LoadingSpinner';

const EVENT_ICONS = {
  CREATED: '📝',
  ASSIGNED: '👤',
  REASSIGNED: '🔄',
  MESSAGE: '💬',
  NOTE: '🔒',
  AI_CHECK: '🤖',
  AI_CHECK_SENT: '🤖',
  RESOLVED: '✅',
  CLOSED: '🔒',
};

export default function TimelinePanel({ consultationId }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await consultationService.getTimeline(consultationId);
        setEvents(data);
      } catch (err) {
        setError(t('failed_load_timeline', 'Failed to load timeline.'));
      } finally {
        setLoading(false);
      }
    })();
  }, [consultationId, t]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-sm font-medium text-red-500 dark:text-red-400">{error}</p>;
  if (events.length === 0) return <p className="text-sm text-slate-400 dark:text-zinc-500 italic font-medium">{t('no_activity_yet', 'No activity yet.')}</p>;

  return (
    <div className="space-y-4">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3 text-sm relative">
          {i !== events.length - 1 && (
            <div className="absolute top-8 left-4 bottom-[-16px] w-px bg-slate-200 dark:bg-zinc-700" />
          )}
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700 z-10 shrink-0 shadow-sm text-base">
            {EVENT_ICONS[e.type] || '•'}
          </div>
          <div className="pt-1 pb-2 flex-1 min-w-0">
            <p className="text-slate-800 dark:text-zinc-200 font-medium whitespace-pre-wrap break-words">{e.detail}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mt-1">{new Date(e.timestamp).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
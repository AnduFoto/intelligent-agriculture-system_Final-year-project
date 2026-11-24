import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../api/authService';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function MyKebelesPage() {
  const [kebeles, setKebeles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    authService
      .getMyKebeles()
      .then((res) => setKebeles(res.data))
      .catch(() => setError(t('failed_load_kebeles_assigned', 'Could not load your assigned Kebeles.')))
      .finally(() => setIsLoading(false));
  }, [t]);

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">{t('my_assigned_kebeles', 'My Assigned Kebeles')}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {t('my_assigned_kebeles_subtitle', 'The Kebeles you cover, as assigned by an Administrator.')}
      </p>

      <Card>
        {isLoading ? (
          <LoadingSpinner message={t('loading', 'Loading...')} />
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-8">{error}</p>
        ) : kebeles.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            {t('no_assigned_kebeles_contact_admin', 'No Kebeles have been assigned to you yet. Contact an Administrator.')}
          </p>
        ) : (
          <ul className="divide-y">
            {kebeles.map((k) => (
              <li key={k.id} className="py-3">
                <p className="text-sm font-medium text-gray-800">
                  {k.name}{' '}
                  <span className="text-gray-400 text-xs font-normal">
                    ({k.woreda_name || k.special_woreda_name})
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('assigned', 'Assigned')} {formatDate(k.assigned_at)}
                  {k.assigned_by_email && ` ${t('by', 'by')} ${k.assigned_by_email}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default MyKebelesPage;
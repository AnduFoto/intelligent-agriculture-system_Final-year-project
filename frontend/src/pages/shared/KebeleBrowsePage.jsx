import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { browseService } from '../../api/browseService';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function KebeleBrowsePage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const rolePrefix = role === 'ADMINISTRATOR' ? '/admin' : '/officer';

  const [kebeles, setKebeles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('name');

  const fetchKebeles = useCallback(() => {
    setIsLoading(true);
    browseService
      .listKebeles({ search: search || undefined, ordering })
      .then((res) => setKebeles(res.data))
      .catch(() => setError(t('failed_load_kebeles_browse', 'Could not load Kebeles.')))
      .finally(() => setIsLoading(false));
  }, [search, ordering, t]);

  useEffect(() => {
    const debounce = setTimeout(fetchKebeles, 300);
    return () => clearTimeout(debounce);
  }, [fetchKebeles]);

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');

  return (
    <div className="max-w-3xl  mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">{t('browse_farmer_predictions', 'Browse Farmer Predictions')}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('select_kebele_explore', 'Select a Kebele to explore prediction activity.')}</p>

      <Card className="mb-4 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_kebele_name', 'Search Kebele by name...')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="name">{t('name_asc', 'Name (A–Z)')}</option>
            <option value="-name">{t('name_desc', 'Name (Z–A)')}</option>
            <option value="-last_prediction_at">{t('most_recently_active', 'Most recently active')}</option>
            <option value="-prediction_count">{t('most_predictions', 'Most predictions')}</option>
          </select>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <LoadingSpinner message={t('loading_kebeles', 'Loading kebeles...')} />
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-8">{error}</p>
        ) : kebeles.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">{t('no_kebeles_found', 'No Kebeles found.')}</p>
        ) : (
          <ul className="divide-y">
            {kebeles.map((k) => (
              <li key={k.id}>
                <button
                  onClick={() => navigate(`${rolePrefix}/browse/kebeles/${k.id}`)}
                  className="w-full text-left py-3 flex items-center justify-between hover:bg-gray-50 px-2 -mx-2 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {k.name}{' '}
                      <span className="text-gray-400 text-xs font-normal">
                        ({k.woreda_name || k.special_woreda_name})
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {k.prediction_count} {k.prediction_count !== 1 ? t('predictions_plural', 'predictions') : t('prediction_singular', 'prediction')} · {t('last_activity', 'Last activity')}: {formatDate(k.last_prediction_at)}
                    </p>
                  </div>
                  <span className="text-gray-300">→</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default KebeleBrowsePage;
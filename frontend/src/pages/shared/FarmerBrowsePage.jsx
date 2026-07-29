import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { browseService } from '../../api/browseService';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function FarmerBrowsePage() {
  const { kebeleId, crop } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const rolePrefix = role === 'ADMINISTRATOR' ? '/admin' : '/officer';

  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    browseService
      .listFarmers(kebeleId, crop)
      .then((res) => setFarmers(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load farmers.'))
      .finally(() => setIsLoading(false));
  }, [kebeleId, crop]);

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(`${rolePrefix}/browse/kebeles/${kebeleId}`)}
        className="text-sm text-primary-600 hover:text-primary-700 mb-4"
      >
        ← Back to Crops
      </button>

      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Farmers — {decodeURIComponent(crop)}</h1>
      <p className="text-sm text-gray-500 mb-6">Farmers who predicted this crop in this Kebele.</p>

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Loading farmers..." />
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-8">{error}</p>
        ) : farmers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No farmers found.</p>
        ) : (
          <ul className="divide-y">
            {farmers.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => navigate(`${rolePrefix}/browse/farmers/${f.id}?crop=${encodeURIComponent(crop)}`)}
                  className="w-full text-left py-3 flex items-center justify-between hover:bg-gray-50 px-2 -mx-2 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{f.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {f.email} · {f.prediction_count} prediction{f.prediction_count !== 1 ? 's' : ''} · Last: {formatDate(f.last_prediction_at)}
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

export default FarmerBrowsePage;
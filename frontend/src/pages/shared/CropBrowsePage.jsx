import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { browseService } from '../../api/browseService';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function CropBrowsePage() {
  const { kebeleId } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const rolePrefix = role === 'ADMINISTRATOR' ? '/admin' : '/officer';

  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    browseService
      .listCrops(kebeleId)
      .then((res) => setCrops(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load crops.'))
      .finally(() => setIsLoading(false));
  }, [kebeleId]);

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(`${rolePrefix}/browse/kebeles`)}
        className="text-sm text-primary-600 hover:text-primary-700 mb-4"
      >
        ← Back to Kebeles
      </button>

      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Crop Types</h1>
      <p className="text-sm text-gray-500 mb-6">Predicted crops within this Kebele.</p>

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Loading crops..." />
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-8">{error}</p>
        ) : crops.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No predictions in this Kebele yet.</p>
        ) : (
          <ul className="divide-y">
            {crops.map((c) => (
              <li key={c.crop}>
                <button
                  onClick={() => navigate(`${rolePrefix}/browse/kebeles/${kebeleId}/crops/${encodeURIComponent(c.crop)}`)}
                  className="w-full text-left py-3 flex items-center justify-between hover:bg-gray-50 px-2 -mx-2 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.crop}</p>
                    <p className="text-xs text-gray-400">
                      {c.prediction_count} prediction{c.prediction_count !== 1 ? 's' : ''} · Last: {formatDate(c.last_prediction_at)}
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

export default CropBrowsePage;
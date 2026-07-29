import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { predictionService } from '../../api/predictionService';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function PredictionHistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    predictionService
      .listHistory()
      .then((response) => setHistory(response.data.results || response.data))
      .catch(() => setError('Could not load prediction history.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Prediction History</h1>
          <p className="text-sm text-gray-500">Your past crop disease diagnoses.</p>
        </div>
        <Link to="/farmer/predict" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          + New Diagnosis
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading history..." />
      ) : error ? (
        <p className="text-sm text-red-600 text-center py-8">{error}</p>
      ) : history.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 text-center py-8">
            No predictions yet. Upload a crop image to get started.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <Link key={item.id} to={`/farmer/predictions/${item.id}`}>
              <Card className="hover:shadow-md transition h-full">
                <img
                  src={item.image}
                  alt={item.display_name}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
                <span
                  className={`inline-block text-xs px-2 py-1 rounded mb-2 ${
                    item.is_healthy ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.is_healthy ? 'Healthy' : 'Disease Detected'}
                </span>
                <h3 className="font-semibold text-gray-800 text-sm">{item.display_name}</h3>
                <p className="text-xs text-gray-500">{item.crop} — {item.confidence}%</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PredictionHistoryPage;
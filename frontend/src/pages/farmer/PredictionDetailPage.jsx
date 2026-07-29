import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { predictionService } from '../../api/predictionService';
import { PredictionResult } from './DiseaseDetectionPage';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function PredictionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    predictionService
      .getHistoryDetail(id)
      .then((response) => setResult(response.data))
      .catch(() => setError('Could not load this prediction record.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/farmer/predictions')}
        className="text-sm text-primary-600 hover:text-primary-700 mb-4"
      >
        ← Back to History
      </button>

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Loading..." />
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-8">{error}</p>
        ) : (
          <PredictionResult result={result} onAnalyzeAnother={() => navigate('/farmer/predict')} />
        )}
      </Card>
    </div>
  );
}

export default PredictionDetailPage;
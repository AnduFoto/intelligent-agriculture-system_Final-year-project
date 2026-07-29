import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { browseService } from '../../api/browseService';
import { PredictionResult } from '../farmer/DiseaseDetectionPage';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function FarmerHistoryBrowsePage() {
  const { farmerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCrop = searchParams.get('crop') || '';
  const { role } = useAuth();
  const navigate = useNavigate();
  const rolePrefix = role === 'ADMINISTRATOR' ? '/admin' : '/officer';

  const [farmer, setFarmer] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [selectedPredictionId, setSelectedPredictionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback((cropFilter) => {
    setIsLoading(true);
    setError('');
    browseService
      .getFarmerHistory(farmerId, cropFilter || undefined)
      .then((res) => {
        setFarmer(res.data.farmer);
        setPredictions(res.data.predictions);
        setSelectedPredictionId(res.data.predictions[0]?.id ?? null);

        // Build the set of crops this farmer has ever predicted, but
        // only from an unfiltered fetch — otherwise a filtered fetch
        // would shrink the switcher's own option list.
        if (!cropFilter) {
          const crops = [...new Set(res.data.predictions.map((p) => p.crop))];
          setAvailableCrops(crops);
        }
      })
      .catch((err) => setError(err.response?.data?.detail || 'Could not load this Farmer\'s history.'))
      .finally(() => setIsLoading(false));
  }, [farmerId]);

  // Initial load: always fetch unfiltered first, to populate the
  // crop-switcher options, then apply the initial crop filter (if
  // one was passed in via the URL from the previous drill-down step).
  useEffect(() => {
    fetchHistory(null);
  }, [fetchHistory]);

  useEffect(() => {
    if (selectedCrop) {
      fetchHistory(selectedCrop);
    }
  }, [selectedCrop]);

  const handleCropChange = (crop) => {
    setSelectedCrop(crop);
    setSearchParams(crop ? { crop } : {});
  };

  const selectedPrediction = predictions.find((p) => p.id === selectedPredictionId);

  if (isLoading && !farmer) {
    return <LoadingSpinner fullScreen message="Loading farmer history..." />;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-primary-600 hover:text-primary-700">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-primary-600 hover:text-primary-700 mb-4">
        ← Back
      </button>

      <h1 className="text-2xl font-semibold text-gray-800 mb-1">{farmer?.full_name}</h1>
      <p className="text-sm text-gray-500 mb-6">{farmer?.email}</p>

      <Card className="mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Crop:</span>
          <button
            onClick={() => handleCropChange('')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              !selectedCrop ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Crops
          </button>
          {availableCrops.map((crop) => (
            <button
              key={crop}
              onClick={() => handleCropChange(crop)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                selectedCrop === crop ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </Card>

      {isLoading ? (
        <LoadingSpinner message="Loading..." />
      ) : predictions.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-400 text-center py-8">No predictions found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <Card>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {predictions.length} prediction{predictions.length !== 1 ? 's' : ''}
              </p>
              <ul className="divide-y">
                {predictions.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedPredictionId(p.id)}
                      className={`w-full text-left py-2 px-2 -mx-2 rounded-md text-xs ${
                        selectedPredictionId === p.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <p>{p.display_name}</p>
                      <p className="text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="sm:col-span-2">
            <Card>
              {selectedPrediction && (
                <PredictionResult
                  result={{ ...selectedPrediction, is_valid_crop_image: true }}
                  onAnalyzeAnother={null}
                />
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerHistoryBrowsePage;
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { predictionService } from '../../api/predictionService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';


function DiseaseDetectionPage() {
  const { role } = useAuth();
  const rolePrefix = role === 'ADMINISTRATOR' ? '/admin' : role === 'OFFICER' ? '/officer' : '/farmer';
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [rejection, setRejection] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResult(null);
    setRejection(null);
    setError('');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setResult(null);
    setRejection(null);
    setError('');

    try {
      const response = await predictionService.predict(selectedFile);

      if (response.data.is_valid_crop_image === false) {
        setRejection(response.data.agent_message);
      } else {
        setResult(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setRejection(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Crop Disease Detection</h1>
          <p className="text-sm text-gray-500">Upload a clear photo of a crop leaf to get an AI diagnosis.</p>
        </div>
        <Link to={`${rolePrefix}/predictions`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View History →
        </Link>
      </div>
      
      <Card>
        {!result && (
          <>
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium hover:file:bg-primary-100"
              />
            </div>

            {previewUrl && (
              <div className="mb-4">
                <img
                  src={previewUrl}
                  alt="Selected crop leaf"
                  className="max-h-80 rounded-md border border-gray-200 mx-auto"
                />
              </div>
            )}

            <Alert variant="error">{error}</Alert>
            {rejection && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 text-sm rounded whitespace-pre-line">
                {rejection}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile}
                isLoading={isSubmitting}
                loadingText="Analyzing..."
              >
                Analyze Image
              </Button>
              {(selectedFile || rejection) && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-gray-700 px-4"
                >
                  Clear
                </button>
              )}
            </div>
          </>
        )}

        {result && <PredictionResult result={result} onAnalyzeAnother={handleReset} />}
      </Card>
    </div>
  );
}

export function PredictionResult({ result, onAnalyzeAnother }) {
  const sol = result.solution_detail;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <img
          src={result.image}
          alt={result.display_name}
          className="w-full sm:w-48 h-48 object-cover rounded-md border border-gray-200"
        />
        <div>
          <span
            className={`inline-block text-xs px-2 py-1 rounded mb-2 ${
              result.is_healthy ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {result.is_healthy ? 'Healthy' : sol?.severity || 'Disease Detected'}
          </span>
          <h2 className="text-xl font-semibold text-gray-800">{result.display_name}</h2>
          <p className="text-sm text-gray-500 mb-1">{result.crop} — {result.confidence}% confidence</p>
          <p className="text-sm text-gray-600 mt-2">{sol?.description}</p>
        </div>
      </div>

      {sol?.symptoms?.length > 0 && (
        <DetailSection title="Symptoms" items={sol.symptoms} />
      )}
      {sol?.immediate_actions?.length > 0 && (
        <DetailSection title="Immediate Actions" items={sol.immediate_actions} />
      )}
      {sol?.chemical_treatment?.length > 0 && (
        <DetailSection title="Chemical Treatment" items={sol.chemical_treatment} />
      )}
      {sol?.organic_treatment?.length > 0 && (
        <DetailSection title="Organic Treatment" items={sol.organic_treatment} />
      )}
      {sol?.prevention?.length > 0 && (
        <DetailSection title="Prevention" items={sol.prevention} />
      )}
      {sol?.fertilizer_advice && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Fertilizer Advice</h3>
          <p className="text-sm text-gray-600">{sol.fertilizer_advice}</p>
        </div>
      )}

      <button
        onClick={onAnalyzeAnother}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
      >
        ← Analyze Another Image
      </button>
    </div>
  );
}

function DetailSection({ title, items }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <ul className="list-disc list-inside text-sm text-gray-600 space-y-0.5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default DiseaseDetectionPage;
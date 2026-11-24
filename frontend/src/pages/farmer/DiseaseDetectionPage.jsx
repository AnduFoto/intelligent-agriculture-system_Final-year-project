import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { predictionService } from '../../api/predictionService';
import { getRecommendations } from '../../api/educationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export default function DiseaseDetectionPage() {
  const { role } = useAuth();
  const { t } = useTranslation();
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
      setError(err.response?.data?.detail || t('something_went_wrong', 'Something went wrong. Please try again.'));
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('crop_disease_detection', 'Crop Disease Detection')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('crop_disease_detection_desc', 'Upload a clear photo of a crop leaf to get an AI diagnosis.')}
          </p>
        </div>
        
        <Link 
          to={`${rolePrefix}/predictions`} 
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('view_history', 'View History')}
        </Link>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <Card className="p-6 sm:p-8 shadow-md border-primary-100 dark:border-primary-500/20">
        {!result ? (
          <div className="space-y-6">
            
            {/* GUIDELINES */}
            <div className="space-y-4 border-b border-slate-100 dark:border-zinc-800/80 pb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {t('scanning_guidelines', 'Scanning Guidelines')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold">1</div>
                  <span>{t('guide_step_1', 'Ensure good natural lighting without glare')}</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold">2</div>
                  <span>{t('guide_step_2', 'Focus clearly on the affected part of the leaf')}</span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold">3</div>
                  <span>{t('guide_step_3', 'Avoid blurry images or multiple crops in one frame')}</span>
                </div>
              </div>
            </div>

            {/* VISUAL EVIDENCE / UPLOAD SECTION */}
            <div className="space-y-4 border-b border-slate-100 dark:border-zinc-800/80 pb-6">
              <div className="flex justify-between items-end">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  {t('crop_leaf_photo', 'Crop Leaf Photo')}
                </h4>
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">({t('required', 'required')})</span>
              </div>
              
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-primary-400 dark:hover:border-primary-500 bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors">
                  <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100 dark:border-zinc-700 text-slate-400 dark:text-zinc-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 mb-1">
                    {previewUrl ? t('click_or_drop_to_replace', 'Click or drag to choose a different photo') : t('upload_photo_click', 'Click or drag leaf photo here')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {t('upload_photos_hint', 'PNG, JPG, WEBP up to 10MB')}
                  </p>
                </div>
              </div>

              {previewUrl && (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 max-w-sm mx-auto shadow-sm mt-4">
                  <img
                    src={previewUrl}
                    alt="Selected crop leaf"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-xs bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md">
                      {t('click_to_change', 'Click to change image')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {rejection && (
              <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">
                      {t('image_rejected', 'Image Not Valid for Analysis')}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-600/80 whitespace-pre-line font-medium leading-relaxed">
                      {rejection}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!selectedFile}
                isLoading={isSubmitting}
                loadingText={t('analyzing', 'Analyzing...')}
                className="w-full sm:w-auto px-8 py-3 shadow-primary-500/30"
              >
                {t('analyze_image', 'Analyze Image')}
              </Button>
              
              {(selectedFile || rejection) && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="px-6 py-3"
                >
                  {t('clear', 'Clear')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <PredictionResult result={result} onAnalyzeAnother={handleReset} />
        )}
      </Card>
    </div>
  );
}

export function PredictionResult({ result, onAnalyzeAnother }) {
  const sol = result?.solution_detail;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role } = useAuth();
  const rolePrefix = role === 'ADMINISTRATOR' ? '/admin' : role === 'OFFICER' ? '/officer' : '/farmer';
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    if (result && result.crop) {
      // Build search topics based on the AI result
      const topics = [result.crop];
      if (result.display_name && !result.is_healthy) {
        topics.push(result.display_name);
      }
      
      getRecommendations(topics)
        .then(data => {
          setRecommendations(data.results || data || []);
        })
        .catch(err => console.error('Failed to load recommendations:', err))
        .finally(() => setLoadingRecs(false));
    }
  }, [result]);

  return (
    <div className="animate-fadeIn space-y-8">
      
      {/* RESULT HEADER */}
      <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
        <div className="shrink-0 relative group rounded-xl overflow-hidden shadow-sm w-full sm:w-52 h-52 bg-slate-100 dark:bg-zinc-800">
          <img
            src={result.image}
            alt={result.display_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <Badge variant={result.is_healthy ? 'success' : 'error'} className="px-3 py-1 text-xs uppercase tracking-wider">
              {result.is_healthy ? t('healthy', 'Healthy') : (sol?.severity || t('disease_detected', 'Disease Detected'))}
            </Badge>
            <Badge variant="primary" className="px-3 py-1 text-xs font-mono">
              {result.confidence}% {t('confidence', 'Confidence')}
            </Badge>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">
            {result.display_name}
          </h2>
          <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">
            {result.crop}
          </p>
          
          {sol?.description && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
              {sol.description}
            </p>
          )}

          {/* Quick Consultation CTA for Farmers if disease detected */}
          {!result.is_healthy && role === 'FARMER' && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80">
              <Link
                to="/farmer/consultations/new"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                <span>{t('need_expert_help', 'Need personalized expert help? Start a consultation')}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* TOP PREDICTIONS BREAKDOWN (IF MULTIPLE) */}
      {result.top_predictions && result.top_predictions.length > 1 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            {t('alternative_possibilities', 'Model Probabilities')}
          </h4>
          <div className="space-y-2.5">
            {result.top_predictions.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-zinc-300">{p.disease || p.display_name || p.class}</span>
                  <span className="font-mono text-slate-500 dark:text-zinc-400">{p.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(0, p.confidence))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-COLUMN SECTION: AI DETAILED ADVICE & GUIDES */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
        
        {/* DETAILS SECTION - AI STREAMING RESULT */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {t('ai_analysis_result', 'AI Treatment & Management')}
            </h3>
            
            <StreamingMarkdown content={generateMarkdownFromResult(sol, t)} speed={15} />
          </div>
        </div>

        {/* RECOMMENDATIONS SECTION */}
        {/* <div>
          <div className="bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-zinc-900 border border-primary-100 dark:border-primary-900/30 rounded-3xl p-6 shadow-sm sticky top-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              {t('recommended_official_guides', 'Recommended Official Guides')}
            </h3>
            
            {loadingRecs ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-white dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 h-28 flex flex-col justify-between">
                    <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-1/4 mb-2" />
                    <div className="h-5 bg-slate-200 dark:bg-zinc-700 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-slate-200 dark:bg-zinc-700 rounded w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-zinc-700 rounded w-1/3 mt-2" />
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.slice(0, 4).map(res => (
                  <div 
                    key={res.id} 
                    onClick={() => navigate(`/education/resources/${res.id}`)}
                    className="group cursor-pointer p-5 rounded-2xl border border-white dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider rounded mb-2">
                        {res.category_name}
                      </span>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                        {res.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 font-medium leading-relaxed">
                        {res.short_summary}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      {res.publisher_name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('no_specific_guides', 'No specific official guides found for this issue yet.')}</p>
              </div>
            )}
          </div>
        </div> */}
      {/* </div> */}

      {/* FOOTER ACTIONS */}
      <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-4">
        <Button
          onClick={onAnalyzeAnother}
          className="px-8 py-3 shadow-primary-500/20"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          {t('analyze_another_image', 'Analyze Another Image')}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`${rolePrefix}/predictions`)}
          className="px-6 py-3"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {t('view_history', 'View History')}
        </Button>
      </div>
    </div>
  );
}

export function generateMarkdownFromResult(sol, t) {
  if (!sol) return '';
  let md = '';

  if (sol.symptoms && sol.symptoms.length > 0) {
    md += `### ${t('symptoms', 'Symptoms')}\n`;
    sol.symptoms.forEach(s => md += `- ${s}\n`);
    md += `\n`;
  }

  if (sol.immediate_actions && sol.immediate_actions.length > 0) {
    md += `### ${t('immediate_actions', 'Immediate Actions')}\n`;
    sol.immediate_actions.forEach(a => md += `- ${a}\n`);
    md += `\n`;
  }

  if (sol.chemical_treatment && sol.chemical_treatment.length > 0) {
    md += `### ${t('chemical_treatment', 'Chemical Treatment')}\n`;
    sol.chemical_treatment.forEach(c => md += `- ${c}\n`);
    md += `\n`;
  }

  if (sol.organic_treatment && sol.organic_treatment.length > 0) {
    md += `### ${t('organic_treatment', 'Organic Treatment')}\n`;
    sol.organic_treatment.forEach(o => md += `- ${o}\n`);
    md += `\n`;
  }

  if (sol.prevention && sol.prevention.length > 0) {
    md += `### ${t('prevention', 'Prevention')}\n`;
    sol.prevention.forEach(p => md += `- ${p}\n`);
    md += `\n`;
  }

  if (sol.fertilizer_advice) {
    md += `### ${t('fertilizer_advice', 'Fertilizer Advice')}\n`;
    md += `${sol.fertilizer_advice}\n\n`;
  }

  return md.trim();
}

export function StreamingMarkdown({ content, speed = 15 }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText(''); 
    let timer;
    
    // Slight initial delay before starting stream
    const timeoutId = setTimeout(() => {
      timer = setInterval(() => {
        setDisplayedText((prev) => {
          // If we reached the end, clear interval
          if (prev.length >= content.length) {
            clearInterval(timer);
            return prev;
          }
          // Safely get next character using the current length
          return prev + content.charAt(prev.length);
        });
      }, speed);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (timer) clearInterval(timer);
    };
  }, [content, speed]);
  
  return (
    <div className="prose prose-sm sm:prose-base dark:prose-invert prose-emerald prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-white prose-li:text-slate-600 dark:prose-li:text-zinc-300 prose-p:text-slate-600 dark:prose-p:text-zinc-300 max-w-none transition-opacity duration-300">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      {displayedText.length < content.length && (
        <span className="inline-block w-2 h-4 bg-emerald-500/80 animate-pulse align-middle ml-1 rounded-sm" />
      )}
    </div>
  );
}
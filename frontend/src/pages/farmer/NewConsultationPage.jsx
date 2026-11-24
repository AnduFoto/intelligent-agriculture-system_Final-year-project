import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import consultationService from '../../api/consultationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';

export default function NewConsultationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [cropTypes, setCropTypes] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);

  const [cropTypeId, setCropTypeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoadingCrops(true);
      try {
        const data = await consultationService.listCropTypes();
        const list = Array.isArray(data) ? data : data.results || [];
        setCropTypes(list.filter((c) => c.is_active));
      } catch (err) {
        setError(t('failed_load_crops', 'Failed to load crop list.'));
      } finally {
        setLoadingCrops(false);
      }
    })();
  }, [t]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newFiles = [...images, ...files];
    setImages(newFiles);
    
    // Create previews
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cropTypeId) {
      setError(t('select_crop_required', 'Please select a crop type.'));
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError(t('title_desc_required', 'Please fill in both the title and description.'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const consultation = await consultationService.createConsultation({
        cropTypeId: Number(cropTypeId),
        title: title.trim(),
        description: description.trim(),
        images,
      });
      navigate(`/farmer/consultations/${consultation.id}`);
    } catch (err) {
      const errors = err.response?.data?.errors || err.response?.data;
      const message =
        (errors && typeof errors === 'object' && Object.values(errors).flat().join(' ')) ||
        err.response?.data?.detail ||
        t('failed_submit_consultation', 'Failed to submit consultation.');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* HEADER & NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <button 
            type="button"
            onClick={() => navigate('/farmer/consultations')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl w-fit mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back_to_consultations', 'Back to Consultations')}
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('new_consultation', 'New Consultation')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('new_consultation_desc', 'Describe your agricultural issue and get connected with an extension officer.')}
          </p>
        </div>
        
        <Link
          to="/farmer/consultations"
          className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {t('my_consultations', 'My Consultations')}
        </Link>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <Card className="p-6 sm:p-8 shadow-md border-primary-100 dark:border-primary-500/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* GUIDELINES */}
          <div className="space-y-4 border-b border-slate-100 dark:border-zinc-800/80 pb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              {t('consultation_tips', 'Helpful Tips')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold">1</div>
                <span>{t('tip_crop_select', 'Choose the exact crop category affected')}</span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold">2</div>
                <span>{t('tip_symptoms', 'Detail when symptoms appeared and weather conditions')}</span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 font-bold">3</div>
                <span>{t('tip_photos', 'Upload clear photos of leaves, stems, or pests')}</span>
              </div>
            </div>
          </div>

          {/* CROP INFORMATION */}
          <div className="space-y-4 border-b border-slate-100 dark:border-zinc-800/80 pb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              {t('crop_information', 'Crop Information')}
            </h4>
            
            {loadingCrops ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                <span className="text-sm text-slate-500 dark:text-zinc-400">{t('loading_crops', 'Loading crop types...')}</span>
              </div>
            ) : (
              <SelectField 
                label={t('crop_type', 'Crop Type')} 
                value={cropTypeId} 
                onChange={(v) => setCropTypeId(v)}
              >
                <option value="">-- {t('select_a_crop', 'Select a crop')} --</option>
                {cropTypes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
            )}
          </div>

          {/* ISSUE DETAILS */}
          <div className="space-y-4 border-b border-slate-100 dark:border-zinc-800/80 pb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              {t('issue_details', 'Issue Details')}
            </h4>
            
            <TextField 
              label={t('title', 'Title')} 
              value={title} 
              onChange={setTitle} 
              placeholder={t('issue_title_placeholder', 'Short summary of the issue (e.g. Yellowing on wheat leaves)')}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-300 uppercase tracking-wider mb-1">
                {t('description', 'Description')}
              </label>
              <textarea
                className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('issue_desc_placeholder', 'Describe what you are seeing — symptoms, when it started, affected farm area, fertilizers or treatments already used, etc.')}
              />
            </div>
          </div>

          {/* VISUAL EVIDENCE */}
          <div className="space-y-4 border-b border-slate-100 dark:border-zinc-800/80 pb-6">
            <div className="flex justify-between items-end">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                {t('visual_evidence', 'Visual Evidence')}
              </h4>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">({t('optional', 'optional')})</span>
            </div>
            
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full border-2 border-dashed border-slate-200 dark:border-zinc-700 hover:border-primary-400 dark:hover:border-primary-500 bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors">
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100 dark:border-zinc-700 text-slate-400 dark:text-zinc-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 mb-1">{t('upload_photos', 'Click or drag photos here')}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{t('upload_photos_hint', 'PNG, JPG up to 10MB each')}</p>
              </div>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 aspect-square shadow-sm bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={src}
                      alt={`preview ${i}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title={t('remove', 'Remove')}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button 
              type="submit" 
              isLoading={submitting} 
              loadingText={t('submitting', 'Submitting...')} 
              className="w-full sm:w-auto px-8 py-3 shadow-primary-500/30"
            >
              {t('submit_consultation', 'Submit Consultation')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/farmer/consultations')}
              className="px-6 py-3"
            >
              {t('cancel', 'Cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
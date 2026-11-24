import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  getResource, 
  createResource, 
  updateResource, 
} from '../../api/educationService';
import cropTypeService from '../../api/cropTypeService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import SelectField from '../../components/ui/SelectField';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../context/AuthContext';

export default function ResourceEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  
  const [crops, setCrops] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    language: 'EN',
    short_summary: '',
    content: '',
    related_crops: [],
  });
  
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const loadFormData = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    setError('');
    try {
      const [cropsRes] = await Promise.all([
        cropTypeService.listCropTypes()
      ]);
      
      setCrops(cropsRes.results || cropsRes);

      if (isEdit) {
        const resource = await getResource(id);
        const resourceAuthorId = typeof resource.created_by === 'object' ? Number(resource.created_by?.id) : Number(resource.created_by);
        const currentUserId = user?.id ? Number(user.id) : null;
        const isAuthor = user?.role === 'ADMINISTRATOR' || (currentUserId && resourceAuthorId && resourceAuthorId === currentUserId);
        if (!isAuthor) {
          setIsUnauthorized(true);
          setError(t('cannot_edit_others_resource', 'You are only authorized to edit educational resources that you have authored.'));
          return;
        }
        setFormData({
          title: resource.title || '',
          language: resource.language || 'EN',
          short_summary: resource.short_summary || '',
          content: resource.content || '',
          related_crops: resource.related_crops ? resource.related_crops.map(c => c.id) : [],
        });
        if (resource.cover_image) {
          setCoverImagePreview(resource.cover_image);
        }
      }
    } catch (err) {
      setError(t('failed_load_form_data', 'Failed to load form data'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, user, authLoading, t]);

  useEffect(() => {
    if (!authLoading) {
      loadFormData();
    }
  }, [authLoading, loadFormData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const options = Array.from(e.target.options);
    const selectedValues = options.filter(opt => opt.selected).map(opt => Number(opt.value));
    handleInputChange('related_crops', selectedValues);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const onFinish = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.short_summary || !formData.content) {
      setError(t('required_fields_missing', 'Please fill in all required fields.'));
      return;
    }

    setSubmitting(true);
    setError('');
    
    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        if (Array.isArray(formData[key])) {
          formData[key].forEach(val => submitData.append(key, val));
        } else {
          submitData.append(key, formData[key]);
        }
      }
    });

    if (coverImage) {
      submitData.append('cover_image', coverImage);
    }

    submitData.append('status', 'PUBLISHED');

    try {
      if (isEdit) {
        await updateResource(id, submitData);
      } else {
        await createResource(submitData);
      }
      navigate('/education/manage');
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_save_resource', 'Failed to save resource'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{t('loading_editor', 'Loading editor...')}</p>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn p-6">
        <Alert variant="error">
          {error || t('cannot_edit_others_resource', 'You are only authorized to edit educational resources that you have authored.')}
        </Alert>
        <button 
          onClick={() => navigate('/education/manage')} 
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('back_to_dashboard', 'Back to Dashboard')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* NAVIGATION */}
      <button onClick={() => navigate('/education/manage')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl w-fit">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        {t('back_to_dashboard', 'Back to Dashboard')}
      </button>
      
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          {isEdit ? t('edit_resource', 'Edit Educational Resource') : t('create_new_resource', 'Create New Educational Resource')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          {isEdit ? t('edit_resource_desc', 'Update the information and content for this resource.') : t('create_resource_desc', 'Publish a new guide, manual, or research material for farmers.')}
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="p-6 sm:p-8">
        <form onSubmit={onFinish} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label={t('title', 'Title')}
              value={formData.title}
              onChange={(v) => handleInputChange('title', v)}
              placeholder={t('title_placeholder', 'E.g. Comprehensive Guide to Tomato Blight')}
              required
            />

            <SelectField
              label={t('language', 'Language')}
              value={formData.language}
              onChange={(v) => handleInputChange('language', v)}
            >
              <option value="EN">{t('english', 'English')}</option>
              <option value="AM">{t('amharic', 'Amharic')}</option>
            </SelectField>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('short_summary', 'Short Summary')} <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 transition-all outline-none resize-none"
              rows={3}
              value={formData.short_summary}
              onChange={(e) => handleInputChange('short_summary', e.target.value)}
              placeholder={t('summary_placeholder', 'A brief description of this resource...')}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>{t('content', 'Content (Markdown or Plain Text)')} <span className="text-red-500">*</span></span>
            </label>
            <textarea
              className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 transition-all outline-none font-mono resize-y min-h-[300px]"
              rows={12}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder={t('content_placeholder', 'Write your full guide here...')}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t('related_crops', 'Related Crops')}
              </label>
              <select
                multiple
                value={formData.related_crops}
                onChange={handleMultiSelectChange}
                className="w-full bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white transition-all outline-none min-h-[120px]"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id} className="p-2 hover:bg-primary-50 dark:hover:bg-zinc-800 rounded">
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 dark:text-zinc-500">{t('hold_ctrl_cmd', 'Hold Ctrl (Windows) or Cmd (Mac) to select multiple')}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('cover_image', 'Cover Image (Optional)')}
            </label>
            
            <div className="flex items-center gap-6">
              {coverImagePreview ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 group">
                  <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={clearImage}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 font-semibold text-xs"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {t('remove', 'Remove')}
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs font-semibold">{t('no_image', 'No Image')}</span>
                </div>
              )}
              
              <div className="flex-1">
                <input
                  type="file"
                  id="coverImageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label 
                  htmlFor="coverImageUpload"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  {coverImagePreview ? t('change_image', 'Change Image') : t('upload_image', 'Upload Image')}
                </label>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">
                  {t('image_upload_help', 'Recommended size: 1200x800px. Max size 2MB.')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-zinc-800 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/education/manage')} 
              disabled={submitting}
              className="px-6"
            >
              {t('cancel', 'Cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={submitting} 
              isLoading={submitting} 
              loadingText={t('saving', 'Saving...')}
              className="px-8 shadow-primary-500/30"
            >
              {t('save_resource', 'Save Resource')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

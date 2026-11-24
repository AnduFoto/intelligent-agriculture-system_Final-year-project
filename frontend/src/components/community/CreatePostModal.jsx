import React, { useState, useEffect, useRef } from 'react';
import { Modal, Select, message, Button } from 'antd';
import { Image as ImageIcon, Video, X, MapPin, Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import cropTypeService from '../../api/cropTypeService';

const getFormattedLocation = (entity) => {
  if (!entity) return null;

  if (entity.location_summary && typeof entity.location_summary === 'string' && entity.location_summary.trim()) {
    return entity.location_summary;
  }

  const kebeleName = entity.kebele_name || (typeof entity.kebele === 'object' ? entity.kebele?.name : (typeof entity.kebele === 'string' && isNaN(entity.kebele) ? entity.kebele : null));
  if (kebeleName) return `Kebele: ${kebeleName}`;

  const specialWoredaName = entity.special_woreda_name || (typeof entity.special_woreda === 'object' ? entity.special_woreda?.name : (typeof entity.special_woreda === 'string' && isNaN(entity.special_woreda) ? entity.special_woreda : null));
  if (specialWoredaName) return `Special Woreda: ${specialWoredaName}`;

  const woredaName = entity.woreda_name || (typeof entity.woreda === 'object' ? entity.woreda?.name : (typeof entity.woreda === 'string' && isNaN(entity.woreda) ? entity.woreda : null));
  if (woredaName) return `Woreda: ${woredaName}`;

  const regionName = entity.region_name || (typeof entity.region === 'object' ? entity.region?.name : (typeof entity.region === 'string' && isNaN(entity.region) ? entity.region : null));
  if (regionName) return `Region: ${regionName}`;

  return null;
};

export const CreatePostModal = ({ isOpen, initialMode, initialFiles = [], onClose, onPostCreated, onPostUpdated, editingPost, user }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [crops, setCrops] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [cropDropdownOpen, setCropDropdownOpen] = useState(false);

  const cropSelectRef = useRef(null);

  // Load Crops & Pre-fill form if editing or initialFiles
  useEffect(() => {
    if (isOpen) {
      cropTypeService.listCropTypes().then(res => setCrops(res.results || res || [])).catch(() => {});

      if (editingPost) {
        setContent(editingPost.content || '');
        setSelectedCrop(editingPost.crop_type || null);
        if (editingPost.media_files && editingPost.media_files.length > 0) {
          setPreviews(editingPost.media_files.map(m => ({
            url: m.file_url || m.file,
            type: m.media_type,
            name: 'Media'
          })));
        } else {
          setPreviews([]);
        }
        setFiles([]);
      } else {
        setContent('');
        setSelectedCrop(null);

        if (initialFiles && initialFiles.length > 0) {
          const validFiles = [];
          const validPreviews = [];
          for (let file of initialFiles) {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            validFiles.push(file);
            validPreviews.push({
              url: URL.createObjectURL(file),
              type: isVideo ? 'VIDEO' : 'IMAGE',
              name: file.name
            });
          }
          setFiles(validFiles);
          setPreviews(validPreviews);
        } else {
          setFiles([]);
          setPreviews([]);
        }
      }

      if (initialMode === 'CROP_TAG') {
        setCropDropdownOpen(true);
      } else {
        setCropDropdownOpen(false);
      }
    }
  }, [isOpen, editingPost, initialFiles, initialMode]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const validPreviews = [];

    for (let file of selectedFiles) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        message.error(`${file.name} is not a valid image or video.`);
        continue;
      }

      if (isImage && file.size > 10 * 1024 * 1024) {
        message.error(`${file.name} exceeds maximum image size of 10 MB.`);
        continue;
      }

      if (isVideo && file.size > 50 * 1024 * 1024) {
        message.error(`${file.name} exceeds maximum video size of 50 MB.`);
        continue;
      }

      validFiles.push(file);
      validPreviews.push({
        url: URL.createObjectURL(file),
        type: isVideo ? 'VIDEO' : 'IMAGE',
        name: file.name
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...validPreviews]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0 && previews.length === 0) {
      message.warning(t('community.emptyWarning', 'Please add text content or media files for your post.'));
      return;
    }

    setSubmitting(true);
    try {
      if (editingPost) {
        // Edit / Update mode
        const updatePayload = {
          content,
          crop_type: selectedCrop || null,
        };
        await onPostUpdated(editingPost.id, updatePayload);
        message.success(t('community.postUpdated', 'Post updated successfully!'));
      } else {
        // Create mode
        const formData = new FormData();
        formData.append('content', content);
        if (selectedCrop) formData.append('crop_type', selectedCrop);

        // Automatically attach user location internally if present
        const regionId = user?.region_id || (typeof user?.region === 'object' ? user?.region?.id : user?.region);
        const zoneId = user?.zone_id || (typeof user?.zone === 'object' ? user?.zone?.id : user?.zone);
        const woredaId = user?.woreda_id || (typeof user?.woreda === 'object' ? user?.woreda?.id : user?.woreda);
        const specialWoredaId = user?.special_woreda_id || (typeof user?.special_woreda === 'object' ? user?.special_woreda?.id : user?.special_woreda);
        const kebeleId = user?.kebele_id || (typeof user?.kebele === 'object' ? user?.kebele?.id : user?.kebele);

        if (regionId) formData.append('region', regionId);
        if (specialWoredaId) {
          formData.append('special_woreda', specialWoredaId);
        } else {
          if (zoneId) formData.append('zone', zoneId);
          if (woredaId) formData.append('woreda', woredaId);
        }
        if (kebeleId) formData.append('kebele', kebeleId);

        files.forEach((file) => {
          formData.append('files', file);
          formData.append('media_types', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
        });

        await onPostCreated(formData);
        message.success(t('community.postCreated', 'Post shared successfully!'));
      }
      resetForm();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.detail || t('community.postError', 'Failed to save post.'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setSelectedCrop(null);
    setFiles([]);
    setPreviews([]);
    setCropDropdownOpen(false);
  };

  const displayLocation = getFormattedLocation(editingPost || user);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={
        <span className="text-lg font-bold text-slate-800 dark:text-white">
          {editingPost
            ? t('community.editPost', 'Edit Community Post')
            : t('community.createPost', 'Create Community Post')}
        </span>
      }
      className="dark:bg-slate-800"
      width={600}
    >
      <div className="space-y-4 pt-2">
        {/* User Info Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center">
                {user?.first_name ? user.first_name[0] : 'U'}
              </div>
            )}
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{user?.role}</div>
            </div>
          </div>

          {displayLocation && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-full border border-slate-200/60 dark:border-slate-600">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>{displayLocation}</span>
            </div>
          )}
        </div>

        {/* Text area */}
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('community.placeholderText', 'Share agricultural observations, tips, crop status, or ask questions...')}
          className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
        />

        {/* Media Preview Gallery */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
            {previews.map((item, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden group bg-slate-900">
                {item.type === 'IMAGE' ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Metadata: Crop Tag */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Sprout className="w-4 h-4 text-emerald-500" />
            <span>{t('community.cropTagOptional', 'Crop Tag (Optional)')}</span>
          </div>

          <Select
            ref={cropSelectRef}
            open={cropDropdownOpen}
            onDropdownVisibleChange={(open) => setCropDropdownOpen(open)}
            allowClear
            placeholder={t('community.selectCrop', 'Select Agricultural Crop')}
            value={selectedCrop}
            onChange={(val) => setSelectedCrop(val)}
            className="w-full"
            options={crops.map(c => ({ value: c.id, label: c.name }))}
          />
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between pt-2">
          {!editingPost ? (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4" />
                <span>{t('community.photo', 'Photo')}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                <Video className="w-4 h-4" />
                <span>{t('community.video', 'Video')}</span>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button onClick={onClose}>{t('community.cancel', 'Cancel')}</Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              {editingPost
                ? t('community.updatePost', 'Update Post')
                : t('community.post', 'Post')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;

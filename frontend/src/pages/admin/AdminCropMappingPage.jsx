import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import cropTypeService from '../../api/cropTypeService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { 
  GitBranch, 
  MapPin, 
  Search, 
  Sprout, 
  Layers, 
  ChevronRight, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function AdminCropMappingPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [kebeles, setKebeles] = useState([]);
  const [selectedKebele, setSelectedKebele] = useState(null);
  const [loadingKebeles, setLoadingKebeles] = useState(false);

  const [specializations, setSpecializations] = useState([]);
  const [cropMappings, setCropMappings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [mapCropId, setMapCropId] = useState('');
  const [mapSpecId, setMapSpecId] = useState('');
  const [mapping, setMapping] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoadingKebeles(true);
      try {
        const response = await axiosInstance.get('/locations/kebeles/', {
          params: search.trim() ? { search: search.trim() } : {},
        });
        const data = response.data;
        setKebeles(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(t('failed_load_kebeles', 'Failed to load Kebeles.'));
      } finally {
        setLoadingKebeles(false);
      }
    }, search.trim() === '' ? 0 : 300);

    return () => clearTimeout(timeout);
  }, [search, t]);

  const loadKebeleData = async (kebele) => {
    setSelectedKebele(kebele);
    setError('');
    setSuccess('');
    setMapCropId('');
    setMapSpecId('');
    setLoadingData(true);
    try {
      const [specResponse, mappings] = await Promise.all([
        axiosInstance.get(`/consultations/kebeles/${kebele.id}/specializations/`),
        cropTypeService.listKebeleCropMappings(kebele.id),
      ]);
      setSpecializations(specResponse.data || []);
      setCropMappings(mappings || []);
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_load_kebele_data', 'Failed to load data for this Kebele.'));
    } finally {
      setLoadingData(false);
    }
  };

  const handleMapCrop = async (e) => {
    e.preventDefault();
    if (!mapCropId || !mapSpecId) {
      setError(t('select_crop_and_spec', 'Select both a crop and a specialization.'));
      return;
    }
    setMapping(true);
    setError('');
    setSuccess('');
    try {
      await cropTypeService.mapSpecializationToCrop(
        selectedKebele.id,
        Number(mapCropId),
        Number(mapSpecId)
      );
      setSuccess(t('crop_mapped_success', 'Crop successfully mapped to specialization.'));
      setMapCropId('');
      setMapSpecId('');
      loadKebeleData(selectedKebele);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data) ? err.response.data[0] : null) ||
        t('failed_map_crop', 'Failed to map crop.');
      setError(detail);
    } finally {
      setMapping(false);
    }
  };

  const handleUnmapCrop = async (cropId, specializationId) => {
    if (!window.confirm(t('remove_mapping_confirm', 'Remove this specialization mapping from the crop?'))) return;
    setError('');
    try {
      await cropTypeService.unmapSpecializationFromCrop(selectedKebele.id, cropId, specializationId);
      loadKebeleData(selectedKebele);
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_unmap', 'Failed to unmap.'));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-200/60 dark:border-indigo-800/40">
            <GitBranch className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            {t('consultation_routing', 'Advisory & Consultation Routing')}
          </div> */}
          <h1 className="text-2xl ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('crop_mapping_title', 'Crop-to-Specialization Mapping')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('crop_mapping_desc', 'Determine which specialization in each Kebele handles each global crop. This drives intelligent consultation routing.')}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="rounded-xl">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="rounded-xl">
          {success}
        </Alert>
      )}

      {/* 2. Main 2-Column Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Kebele Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {t('select_kebele_1', '1. Select a Kebele')}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {kebeles.length}
            </span>
          </div>

          <Card className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_kebele_placeholder', 'Search Kebele by name...')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
              />
            </div>

            {loadingKebeles ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-xs font-medium text-slate-400 dark:text-zinc-500">{t('loading_kebeles', 'Loading kebeles...')}</p>
              </div>
            ) : kebeles.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-8 italic">
                {t('no_kebeles_found', 'No Kebeles found.')}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-[30rem] overflow-y-auto pr-1">
                {kebeles.map((k) => {
                  const isSelected = selectedKebele?.id === k.id;
                  const woredaText = k.woreda_name || k.special_woreda_name;

                  return (
                    <button
                      key={k.id}
                      onClick={() => loadKebeleData(k)}
                      type="button"
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between my-1 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 shadow-xs'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-slate-800 dark:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-green-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>
                          {k.name}
                        </p>
                        {woredaText && (
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                            {woredaText}
                          </p>
                        )}
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-green-600 dark:text-green-400 translate-x-0.5' : 'text-slate-300 dark:text-zinc-600'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Kebele Crop Mappings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-green-500" />
              {t('step_crop_mapping', '2. Crop-Specialization Links')}
            </h2>
          </div>

          {!selectedKebele ? (
            <Card className="py-20 text-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mx-auto mb-3">
                <GitBranch className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                {t('no_kebele_selected', 'No Kebele selected')}
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">
                {t('select_kebele_to_view_mappings', 'Select a Kebele from the left to configure or inspect how agricultural crops route to officer specializations.')}
              </p>
            </Card>
          ) : loadingData ? (
            <Card className="py-20 text-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                {t('loading_kebele_crop_mappings', 'Loading Kebele crop mappings...')}
              </p>
            </Card>
          ) : specializations.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                {t('no_specializations_yet_admin', 'This Kebele has no specializations configured yet.')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                {t('specializations_needed_hint', 'Its Lead Officer needs to define specializations (e.g. Agronomy, Pest Control, Horticulture) before crops can be linked.')}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              
              {/* Selected Kebele Header */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-green-600 dark:text-green-400 flex items-center justify-center font-bold border border-indigo-200/60 dark:border-indigo-800/40 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-800 dark:text-white">
                        {selectedKebele.name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {selectedKebele.woreda_name || selectedKebele.special_woreda_name || t('kebele_jurisdiction', 'Kebele Jurisdiction')}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                    {specializations.length} {t('specializations_available', 'Specializations')}
                  </span>
                </div>
              </div>

              {/* Map Crop Form */}
              <Card className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    {t('link_crop_to_specialization', 'Link Crop to Specialization')}
                  </h4>
                </div>

                <form onSubmit={handleMapCrop} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        {t('crop_label', 'Crop')}
                      </label>
                      <select
                        className="w-full bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={mapCropId}
                        onChange={(e) => setMapCropId(e.target.value)}
                      >
                        <option value="">{t('select_crop', '-- Select a crop --')}</option>
                        {cropMappings.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        {t('specialization_label', 'Specialization')}
                      </label>
                      <select
                        className="w-full bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={mapSpecId}
                        onChange={(e) => setMapSpecId(e.target.value)}
                      >
                        <option value="">{t('select_specialization', '-- Select a specialization --')}</option>
                        {specializations.filter((s) => s.is_active).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={mapping || !mapCropId || !mapSpecId}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-green-600 hover:bg-green-500 active:scale-95 disabled:opacity-50 transition-all shadow-sm shadow-indigo-500/25"
                    >
                      {mapping ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>{t('map_crop', 'Link Specialization')}</span>
                    </button>
                  </div>
                </form>
              </Card>

              {/* Current Kebele Mappings */}
              <Card className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {t('current_mappings', 'Current Mappings in')} {selectedKebele.name}
                  </h4>
                  <span className="text-xs text-slate-400 dark:text-zinc-500">
                    {cropMappings.length} {t('catalog_crops', 'crops in catalog')}
                  </span>
                </div>

                {cropMappings.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-zinc-500 italic py-6 text-center">
                    {t('no_crops_in_catalog', 'No crops exist in the global catalog yet.')}
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-[30rem] overflow-y-auto">
                    {cropMappings.map((c) => (
                      <div key={c.id} className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 rounded-xl transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                            <Sprout className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                              {c.name}
                            </span>
                            {c.mapped_specializations.length === 0 && (
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic">
                                {t('not_mapped_in_kebele', 'Not linked in this Kebele')}
                              </p>
                            )}
                          </div>
                        </div>

                        {c.mapped_specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 self-start sm:self-center">
                            {c.mapped_specializations.map((spec) => (
                              <span
                                key={spec.id}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                              >
                                <span>{spec.name}</span>
                                <button
                                  onClick={() => handleUnmapCrop(c.id, spec.id)}
                                  className="text-purple-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-0.5"
                                  title={t('remove_mapping', 'Remove link')}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
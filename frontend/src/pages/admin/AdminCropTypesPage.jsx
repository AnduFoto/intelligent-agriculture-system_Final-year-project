import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cropTypeService from '../../api/cropTypeService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { 
  Sprout, 
  Plus, 
  Search, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Power, 
  X,
  Sparkles
} from 'lucide-react';

export default function AdminCropTypesPage() {
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  const loadCrops = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cropTypeService.listCropTypes();
      setCrops(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(t('failed_load_catalog', 'Failed to load crop catalog.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, []);

  const stats = useMemo(() => {
    const total = crops.length;
    const active = crops.filter(c => c.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [crops]);

  const filteredCrops = useMemo(() => {
    if (!search.trim()) return crops;
    const term = search.trim().toLowerCase();
    return crops.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.description || '').toLowerCase().includes(term)
    );
  }, [crops, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError(t('please_enter_crop_name', 'Please enter a crop name.'));
      return;
    }
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      await cropTypeService.createCropType({
        name: newName.trim(),
        description: newDescription.trim(),
      });
      setNewName('');
      setNewDescription('');
      setShowAddForm(false);
      setSuccess(t('crop_added_success', 'Crop added to the catalog.'));
      loadCrops();
    } catch (err) {
      const errors = err.response?.data;
      const message =
        (Array.isArray(errors?.name) && errors.name[0]) ||
        err.response?.data?.detail ||
        t('failed_create_crop', 'Failed to create crop.');
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (crop) => {
    setError('');
    try {
      await cropTypeService.toggleCropActive(crop.id, !crop.is_active);
      loadCrops();
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_update_crop', 'Failed to update crop.'));
    }
  };

  return (
    <div className="space-y-6 ml-4 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/60 dark:border-emerald-800/40">
            <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {t('crop_taxonomy', 'Crop Catalog & Taxonomy')}
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('crop_catalog', 'Crop Catalog')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('crop_catalog_desc', "Global master crop list. Lead Officers map these crops to their Kebele specializations separately.")}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm((s) => !s)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm active:scale-95 shrink-0 ${
            showAddForm
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25'
          }`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? t('cancel', 'Cancel') : t('add_crop', 'Add Crop')}</span>
        </button>
      </div>

      {/* 2. Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('total_crops', 'Total Crops')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('active_crops', 'Active Crops')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.active}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {t('inactive_crops', 'Inactive')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center font-bold">
              <Power className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.inactive}</p>
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

      {/* 3. Add Crop Form */}
      {showAddForm && (
        <Card className="p-5 sm:p-6 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {t('add_new_crop', 'Add New Crop to Master Catalog')}
            </h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('crop_name_label', 'Crop Name *')}
                </label>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('crop_name_placeholder', 'e.g. Tef, Coffee, Tomato, Wheat')}
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  {t('description_optional', 'Description (optional)')}
                </label>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('short_description_placeholder', 'Brief botanical or agricultural notes')}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm shadow-emerald-500/25"
              >
                {creating ? t('adding', 'Adding...') : t('add_crop', 'Add Crop')}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. Search Filter Bar */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_crops_placeholder', 'Search crops in catalog...')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white"
          />
        </div>
      </Card>

      {/* 5. Crops Grid / Directory Table */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('loading_crops', 'Loading crop catalog...')}</p>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Sprout className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800 dark:text-white text-sm">{t('no_crops_yet', 'No crops found.')}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
              {search ? t('adjust_search_filter', 'Try adjusting your search terms.') : t('add_first_crop_hint', 'Add your first crop to initialize the platform agricultural catalog.')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {filteredCrops.map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold ${
                    c.is_active
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200/60 dark:border-zinc-700/60'
                  }`}>
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 dark:text-white text-base">
                        {c.name}
                      </h4>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        c.is_active
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {c.is_active ? t('active', 'Active') : t('inactive', 'Inactive')}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {c.description}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {t('mapped_to_specializations', { count: c.specialization_count, defaultValue: `Mapped to ${c.specialization_count} specialization(s) across all Kebeles` })}
                    </p>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <button
                    onClick={() => handleToggle(c)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      c.is_active
                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{c.is_active ? t('deactivate', 'Deactivate') : t('activate', 'Activate')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { locationAdminService } from '../../api/locationAdminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { 
  MapPin, 
  Building2, 
  Layers, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search, 
  ArrowLeft,
  Globe2,
  Compass
} from 'lucide-react';

export default function AdminLocationManagementPage() {
  const { t } = useTranslation();
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation state: hierarchy drill-down
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedWoreda, setSelectedWoreda] = useState(null);
  const [selectedSpecialWoreda, setSelectedSpecialWoreda] = useState(null);

  const fetchRegions = useCallback(() => {
    setIsLoading(true);
    locationAdminService
      .listRegions()
      .then((res) => setRegions(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const handleRegionRenamed = (updated) => {
    fetchRegions();
    if (selectedRegion?.id === updated.id) setSelectedRegion(updated);
  };

  const navigateToLevel = (level) => {
    if (level === 'regions') {
      setSelectedRegion(null);
      setSelectedZone(null);
      setSelectedWoreda(null);
      setSelectedSpecialWoreda(null);
    } else if (level === 'region') {
      setSelectedZone(null);
      setSelectedWoreda(null);
      setSelectedSpecialWoreda(null);
    } else if (level === 'zone') {
      setSelectedWoreda(null);
    }
  };

  return (
    <div className="space-y-6 ml-4 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/60 dark:border-emerald-800/40">
            <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {t('geographic_hierarchy', 'Geographic Hierarchy')}
          </div> */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('location_management', 'Location Management')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('location_management_subtitle', 'Configure and organize Regions, Zones, Special Woredas, Woredas, and Kebeles.')}
          </p>
        </div>
      </div>

      {/* 2. Interactive Breadcrumb Navigation Bar */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-4 py-3 shadow-xs flex-wrap">
        <button
          onClick={() => navigateToLevel('regions')}
          className={`flex items-center gap-1.5 transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
            !selectedRegion ? 'text-primary-600 dark:text-primary-400 font-bold' : ''
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{t('all_regions', 'All Regions')}</span>
        </button>

        {selectedRegion && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />
            <button
              onClick={() => navigateToLevel('region')}
              className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${
                !selectedZone && !selectedSpecialWoreda ? 'text-primary-600 dark:text-primary-400 font-bold' : ''
              }`}
            >
              {selectedRegion.name}
            </button>
          </>
        )}

        {selectedZone && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />
            <button
              onClick={() => navigateToLevel('zone')}
              className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${
                !selectedWoreda ? 'text-primary-600 dark:text-primary-400 font-bold' : ''
              }`}
            >
              {selectedZone.name}
            </button>
          </>
        )}

        {selectedSpecialWoreda && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {selectedSpecialWoreda.name} ({t('special_woreda', 'Special Woreda')})
            </span>
          </>
        )}

        {selectedWoreda && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600" />
            <span className="text-primary-600 dark:text-primary-400 font-bold">
              {selectedWoreda.name} ({t('woreda', 'Woreda')})
            </span>
          </>
        )}
      </div>

      {/* 3. Level Content Panels */}
      {!selectedRegion && (
        <RegionList
          regions={regions}
          isLoading={isLoading}
          onSelect={setSelectedRegion}
          onChanged={fetchRegions}
        />
      )}

      {selectedRegion && !selectedZone && !selectedSpecialWoreda && (
        <RegionDetail
          region={selectedRegion}
          onBack={() => setSelectedRegion(null)}
          onSelectZone={setSelectedZone}
          onSelectSpecialWoreda={setSelectedSpecialWoreda}
          onRegionRenamed={handleRegionRenamed}
        />
      )}

      {selectedZone && !selectedWoreda && (
        <ZoneDetail
          zone={selectedZone}
          onBack={() => setSelectedZone(null)}
          onSelectWoreda={setSelectedWoreda}
          onZoneRenamed={(updated) => setSelectedZone(updated)}
        />
      )}

      {selectedWoreda && (
        <WoredaDetail
          woreda={selectedWoreda}
          onBack={() => setSelectedWoreda(null)}
          onWoredaRenamed={(updated) => setSelectedWoreda(updated)}
        />
      )}

      {selectedSpecialWoreda && (
        <SpecialWoredaDetail
          specialWoreda={selectedSpecialWoreda}
          onBack={() => setSelectedSpecialWoreda(null)}
          onSpecialWoredaRenamed={(updated) => setSelectedSpecialWoreda(updated)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Reusable Modern Editable Row
// ---------------------------------------------------------------
function EditableRow({ item, onSelect, onSave, onDelete, deleteWarning, iconType = 'map' }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (e) => {
    e.stopPropagation();
    setName(item.name);
    setError('');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t('name_required', 'Name is required.'));
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const updated = await onSave(item, name.trim());
      setIsEditing(false);
      if (updated) item.name = updated.name;
    } catch (err) {
      setError(err.response?.data?.errors?.name?.[0] || t('failed_to_rename', 'Failed to rename.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(deleteWarning || t('confirm_delete', { name: item.name, defaultValue: `Delete "${item.name}"?` }))) return;
    await onDelete(item);
  };

  if (isEditing) {
    return (
      <li className="p-3 bg-primary-50/50 dark:bg-primary-950/20 rounded-xl border border-primary-200 dark:border-primary-800/60 transition-all">
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white"
          />
          <div className="flex gap-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? '...' : t('save', 'Save')}</span>
            </button>
            <button
              onClick={cancelEdit}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-zinc-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('cancel', 'Cancel')}</span>
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 font-semibold mt-1.5">{error}</p>}
      </li>
    );
  }

  return (
    <li className="p-3 sm:px-4 flex items-center justify-between group rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-zinc-700/60">
          {iconType === 'building' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
        </div>
        {onSelect ? (
          <button
            onClick={() => onSelect(item)}
            className="text-sm font-bold text-slate-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-left truncate flex items-center gap-2"
          >
            <span>{item.name}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
          </button>
        ) : (
          <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={startEdit}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title={t('edit', 'Edit')}
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title={t('delete', 'Delete')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------
// Reusable Editable Header
// ---------------------------------------------------------------
function EditableHeader({ label, currentName, onSave }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(currentName);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      await onSave(draft.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.errors?.name?.[0] || t('failed_to_rename_label', { label, defaultValue: `Failed to rename ${label}.` }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full max-w-lg">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-xl px-3.5 py-2 text-base font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors active:scale-95"
            >
              {isSaving ? '...' : t('save', 'Save')}
            </button>
            <button
              onClick={() => { setIsEditing(false); setError(''); }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 transition-colors"
            >
              {t('cancel', 'Cancel')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold border border-primary-200/60 dark:border-primary-800/40">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{label}</span>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{currentName}</h2>
            </div>
          </div>
        )}

        {!isEditing && (
          <button
            onClick={() => { setDraft(currentName); setIsEditing(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('rename', 'Rename')}</span>
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-semibold mt-2">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------
// 1. Region List
// ---------------------------------------------------------------
function RegionList({ regions, isLoading, onSelect, onChanged }) {
  const { t } = useTranslation();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return regions;
    return regions.filter(r => r.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [regions, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await locationAdminService.createRegion({ name: name.trim() });
      setName('');
      setShowCreate(false);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.errors?.name?.[0] || t('failed_create_region', 'Failed to create Region.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRename = async (region, newName) => {
    const response = await locationAdminService.updateRegion(region.id, { name: newName });
    onChanged();
    return response.data;
  };

  const handleDelete = async (region) => {
    await locationAdminService.deleteRegion(region.id);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-slate-800 dark:text-white">{t('regions', 'Regions')}</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
            {regions.length}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_regions', 'Search regions...')}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
            />
          </div>

          <button
            onClick={() => setShowCreate((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
              showCreate
                ? 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                : 'bg-primary-600 hover:bg-primary-500 text-white shadow-xs shadow-primary-500/25'
            }`}
          >
            {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{showCreate ? t('cancel', 'Cancel') : t('add_region', 'Add Region')}</span>
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200/80 dark:border-primary-800/60 rounded-2xl flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              {t('region_name', 'Region Name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enter_region_name', 'Enter region name')}
              className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary-600 hover:bg-primary-500 transition-colors"
          >
            {isSubmitting ? '...' : t('create_region', 'Create Region')}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-7 h-7 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('loading_regions', 'Loading regions...')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-500 text-sm">
            <Globe2 className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="font-semibold">{t('no_regions_yet', 'No regions found.')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80 p-2">
            {filtered.map((r) => (
              <EditableRow
                key={r.id}
                item={r}
                onSelect={onSelect}
                onSave={handleRename}
                onDelete={handleDelete}
                deleteWarning={t('delete_region_warning', { name: r.name, defaultValue: `Delete Region "${r.name}"? This will also delete its Zones, Special Woredas, Woredas, and Kebeles.` })}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------
// 2. Region Detail: Zones + Special Woredas within a Region
// ---------------------------------------------------------------
function RegionDetail({ region, onBack, onSelectZone, onSelectSpecialWoreda, onRegionRenamed }) {
  const { t } = useTranslation();
  const [zones, setZones] = useState([]);
  const [specialWoredas, setSpecialWoredas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [zoneForm, setZoneForm] = useState({ show: false, name: '', error: '' });
  const [swForm, setSwForm] = useState({ show: false, name: '', error: '' });

  const fetchChildren = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      locationAdminService.listZones(region.id),
      locationAdminService.listSpecialWoredas(region.id),
    ])
      .then(([zonesRes, swRes]) => {
        setZones(zonesRes.data.results || zonesRes.data);
        setSpecialWoredas(swRes.data.results || swRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [region.id]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleAddZone = async (e) => {
    e.preventDefault();
    if (!zoneForm.name.trim()) return;
    try {
      await locationAdminService.createZone({ name: zoneForm.name.trim(), region: region.id });
      setZoneForm({ show: false, name: '', error: '' });
      fetchChildren();
    } catch (err) {
      setZoneForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || t('failed_add_zone', 'Failed to add Zone.') }));
    }
  };

  const handleAddSpecialWoreda = async (e) => {
    e.preventDefault();
    if (!swForm.name.trim()) return;
    try {
      await locationAdminService.createSpecialWoreda({ name: swForm.name.trim(), region: region.id });
      setSwForm({ show: false, name: '', error: '' });
      fetchChildren();
    } catch (err) {
      setSwForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || t('failed_add_special_woreda', 'Failed to add Special Woreda.') }));
    }
  };

  const handleRenameZone = async (zone, newName) => {
    const response = await locationAdminService.updateZone(zone.id, { name: newName, region: region.id });
    fetchChildren();
    return response.data;
  };

  const handleRenameSpecialWoreda = async (sw, newName) => {
    const response = await locationAdminService.updateSpecialWoreda(sw.id, { name: newName, region: region.id });
    fetchChildren();
    return response.data;
  };

  const handleDeleteZone = async (zone) => {
    await locationAdminService.deleteZone(zone.id);
    fetchChildren();
  };

  const handleDeleteSpecialWoreda = async (sw) => {
    await locationAdminService.deleteSpecialWoreda(sw.id);
    fetchChildren();
  };

  const handleRenameRegion = async (newName) => {
    const response = await locationAdminService.updateRegion(region.id, { name: newName });
    onRegionRenamed(response.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back_to_regions', 'Back to Regions')}</span>
        </button>
      </div>

      <EditableHeader label={t('region', 'Region')} currentName={region.name} onSave={handleRenameRegion} />

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-7 h-7 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Zones Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('zones', 'Zones')}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {zones.length}
                </span>
              </div>
              <button
                onClick={() => setZoneForm((p) => ({ ...p, show: !p.show }))}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-800/40 hover:bg-primary-100 transition-colors"
              >
                {zoneForm.show ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{zoneForm.show ? t('cancel', 'Cancel') : t('add_zone', 'Add Zone')}</span>
              </button>
            </div>

            {zoneForm.show && (
              <form onSubmit={handleAddZone} className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex gap-2">
                <input
                  autoFocus
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm((p) => ({ ...p, name: e.target.value }))}
                  className="flex-1 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('zone_name', 'Zone name')}
                />
                <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-500">
                  {t('add', 'Add')}
                </button>
              </form>
            )}
            {zoneForm.error && <p className="text-xs text-red-500 font-semibold">{zoneForm.error}</p>}

            <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              {zones.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 py-8 text-center italic">{t('no_zones_yet', 'No zones registered.')}</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80 p-2">
                  {zones.map((z) => (
                    <EditableRow
                      key={z.id}
                      item={z}
                      onSelect={onSelectZone}
                      onSave={handleRenameZone}
                      onDelete={handleDeleteZone}
                      iconType="building"
                      deleteWarning={t('delete_zone_warning', { name: z.name, defaultValue: `Delete Zone "${z.name}"? This will also delete its Woredas and Kebeles.` })}
                    />
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Special Woredas Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('special_woredas', 'Special Woredas')}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                  {specialWoredas.length}
                </span>
              </div>
              <button
                onClick={() => setSwForm((p) => ({ ...p, show: !p.show }))}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 transition-colors"
              >
                {swForm.show ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{swForm.show ? t('cancel', 'Cancel') : t('add_special_woreda', 'Add Special Woreda')}</span>
              </button>
            </div>

            {swForm.show && (
              <form onSubmit={handleAddSpecialWoreda} className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex gap-2">
                <input
                  autoFocus
                  value={swForm.name}
                  onChange={(e) => setSwForm((p) => ({ ...p, name: e.target.value }))}
                  className="flex-1 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={t('special_woreda_name', 'Special Woreda name')}
                />
                <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500">
                  {t('add', 'Add')}
                </button>
              </form>
            )}
            {swForm.error && <p className="text-xs text-red-500 font-semibold">{swForm.error}</p>}

            <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              {specialWoredas.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 py-8 text-center italic">{t('no_special_woredas_yet', 'No special woredas registered.')}</p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80 p-2">
                  {specialWoredas.map((sw) => (
                    <EditableRow
                      key={sw.id}
                      item={sw}
                      onSelect={onSelectSpecialWoreda}
                      onSave={handleRenameSpecialWoreda}
                      onDelete={handleDeleteSpecialWoreda}
                      iconType="map"
                      deleteWarning={t('delete_special_woreda_warning', { name: sw.name, defaultValue: `Delete Special Woreda "${sw.name}"? This will also delete its Kebeles.` })}
                    />
                  ))}
                </ul>
              )}
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// 3. Zone Detail: Woredas within a Zone
// ---------------------------------------------------------------
function ZoneDetail({ zone, onBack, onSelectWoreda, onZoneRenamed }) {
  const { t } = useTranslation();
  const [woredas, setWoredas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ show: false, name: '', error: '' });

  const fetchWoredas = useCallback(() => {
    setIsLoading(true);
    locationAdminService
      .listWoredas(zone.id)
      .then((res) => setWoredas(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [zone.id]);

  useEffect(() => {
    fetchWoredas();
  }, [fetchWoredas]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await locationAdminService.createWoreda({ name: form.name.trim(), zone: zone.id });
      setForm({ show: false, name: '', error: '' });
      fetchWoredas();
    } catch (err) {
      setForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || t('failed_add_woreda', 'Failed to add Woreda.') }));
    }
  };

  const handleRenameWoreda = async (woreda, newName) => {
    const response = await locationAdminService.updateWoreda(woreda.id, { name: newName, zone: zone.id });
    fetchWoredas();
    return response.data;
  };

  const handleDelete = async (w) => {
    await locationAdminService.deleteWoreda(w.id);
    fetchWoredas();
  };

  const handleRenameZone = async (newName) => {
    const response = await locationAdminService.updateZone(zone.id, { name: newName, region: zone.region });
    onZoneRenamed(response.data);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back_to_region', 'Back to Region')}</span>
      </button>

      <EditableHeader label={t('zone', 'Zone')} currentName={zone.name} onSave={handleRenameZone} />

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('woredas', 'Woredas')}</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {woredas.length}
            </span>
          </div>
          <button
            onClick={() => setForm((p) => ({ ...p, show: !p.show }))}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-800/40 hover:bg-primary-100 transition-colors"
          >
            {form.show ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{form.show ? t('cancel', 'Cancel') : t('add_woreda', 'Add Woreda')}</span>
          </button>
        </div>

        {form.show && (
          <form onSubmit={handleAdd} className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex gap-2">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="flex-1 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('woreda_name', 'Woreda name')}
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-500">
              {t('add', 'Add')}
            </button>
          </form>
        )}
        {form.error && <p className="text-xs text-red-500 font-semibold">{form.error}</p>}

        <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-7 h-7 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : woredas.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-zinc-500 py-8 text-center italic">{t('no_woredas_yet', 'No woredas registered.')}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80 p-2">
              {woredas.map((w) => (
                <EditableRow
                  key={w.id}
                  item={w}
                  onSelect={onSelectWoreda}
                  onSave={handleRenameWoreda}
                  onDelete={handleDelete}
                  iconType="building"
                  deleteWarning={t('delete_woreda_warning', { name: w.name, defaultValue: `Delete Woreda "${w.name}"? This will also delete its Kebeles.` })}
                />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// 4. Woreda Detail: Kebeles within a Woreda
// ---------------------------------------------------------------
function WoredaDetail({ woreda, onBack, onWoredaRenamed }) {
  const { t } = useTranslation();
  const [kebeles, setKebeles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ show: false, name: '', error: '' });

  const fetchKebeles = useCallback(() => {
    setIsLoading(true);
    locationAdminService
      .listKebelesByWoreda(woreda.id)
      .then((res) => setKebeles(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [woreda.id]);

  useEffect(() => {
    fetchKebeles();
  }, [fetchKebeles]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await locationAdminService.createKebele({ name: form.name.trim(), woreda: woreda.id });
      setForm({ show: false, name: '', error: '' });
      fetchKebeles();
    } catch (err) {
      setForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || t('failed_add_kebele', 'Failed to add Kebele.') }));
    }
  };

  const handleRenameKebele = async (kebele, newName) => {
    const response = await locationAdminService.updateKebele(kebele.id, { name: newName, woreda: woreda.id });
    fetchKebeles();
    return response.data;
  };

  const handleDelete = async (k) => {
    await locationAdminService.deleteKebele(k.id);
    fetchKebeles();
  };

  const handleRenameWoreda = async (newName) => {
    const response = await locationAdminService.updateWoreda(woreda.id, { name: newName, zone: woreda.zone });
    onWoredaRenamed(response.data);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back_to_zone', 'Back to Zone')}</span>
      </button>

      <EditableHeader label={t('woreda', 'Woreda')} currentName={woreda.name} onSave={handleRenameWoreda} />

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('kebeles', 'Kebeles')}</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {kebeles.length}
            </span>
          </div>
          <button
            onClick={() => setForm((p) => ({ ...p, show: !p.show }))}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-800/40 hover:bg-primary-100 transition-colors"
          >
            {form.show ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{form.show ? t('cancel', 'Cancel') : t('add_kebele', 'Add Kebele')}</span>
          </button>
        </div>

        {form.show && (
          <form onSubmit={handleAdd} className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex gap-2">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="flex-1 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('kebele_name', 'Kebele name')}
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-500">
              {t('add', 'Add')}
            </button>
          </form>
        )}
        {form.error && <p className="text-xs text-red-500 font-semibold">{form.error}</p>}

        <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-7 h-7 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : kebeles.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-zinc-500 py-8 text-center italic">{t('no_kebeles_yet', 'No kebeles registered.')}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80 p-2">
              {kebeles.map((k) => (
                <EditableRow
                  key={k.id}
                  item={k}
                  onSave={handleRenameKebele}
                  onDelete={handleDelete}
                  iconType="map"
                  deleteWarning={t('delete_kebele_warning', { name: k.name, defaultValue: `Delete Kebele "${k.name}"?` })}
                />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// 5. Special Woreda Detail: Kebeles within a Special Woreda
// ---------------------------------------------------------------
function SpecialWoredaDetail({ specialWoreda, onBack, onSpecialWoredaRenamed }) {
  const { t } = useTranslation();
  const [kebeles, setKebeles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ show: false, name: '', error: '' });

  const fetchKebeles = useCallback(() => {
    setIsLoading(true);
    locationAdminService
      .listKebelesBySpecialWoreda(specialWoreda.id)
      .then((res) => setKebeles(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [specialWoreda.id]);

  useEffect(() => {
    fetchKebeles();
  }, [fetchKebeles]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await locationAdminService.createKebele({ name: form.name.trim(), special_woreda: specialWoreda.id });
      setForm({ show: false, name: '', error: '' });
      fetchKebeles();
    } catch (err) {
      setForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || t('failed_add_kebele', 'Failed to add Kebele.') }));
    }
  };

  const handleRenameKebele = async (kebele, newName) => {
    const response = await locationAdminService.updateKebele(kebele.id, { name: newName, special_woreda: specialWoreda.id });
    fetchKebeles();
    return response.data;
  };

  const handleDelete = async (k) => {
    await locationAdminService.deleteKebele(k.id);
    fetchKebeles();
  };

  const handleRenameSpecialWoreda = async (newName) => {
    const response = await locationAdminService.updateSpecialWoreda(specialWoreda.id, { name: newName, region: specialWoreda.region });
    onSpecialWoredaRenamed(response.data);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back_to_region', 'Back to Region')}</span>
      </button>

      <EditableHeader label={t('special_woreda', 'Special Woreda')} currentName={specialWoreda.name} onSave={handleRenameSpecialWoreda} />

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('kebeles', 'Kebeles')}</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              {kebeles.length}
            </span>
          </div>
          <button
            onClick={() => setForm((p) => ({ ...p, show: !p.show }))}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 transition-colors"
          >
            {form.show ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{form.show ? t('cancel', 'Cancel') : t('add_kebele', 'Add Kebele')}</span>
          </button>
        </div>

        {form.show && (
          <form onSubmit={handleAdd} className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex gap-2">
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="flex-1 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={t('kebele_name', 'Kebele name')}
            />
            <button type="submit" className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500">
              {t('add', 'Add')}
            </button>
          </form>
        )}
        {form.error && <p className="text-xs text-red-500 font-semibold">{form.error}</p>}

        <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-7 h-7 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : kebeles.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-zinc-500 py-8 text-center italic">{t('no_kebeles_yet', 'No kebeles registered.')}</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80 p-2">
              {kebeles.map((k) => (
                <EditableRow
                  key={k.id}
                  item={k}
                  onSave={handleRenameKebele}
                  onDelete={handleDelete}
                  iconType="map"
                  deleteWarning={t('delete_kebele_warning', { name: k.name, defaultValue: `Delete Kebele "${k.name}"?` })}
                />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { locationAdminService } from '../../api/locationAdminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function AdminLocationManagementPage() {
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation state: which level are we drilled into?
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedWoreda, setSelectedWoreda] = useState(null);
  const [selectedSpecialWoreda, setSelectedSpecialWoreda] = useState(null);

  const fetchRegions = useCallback(() => {
    setIsLoading(true);
    locationAdminService
      .listRegions()
      .then((res) => setRegions(res.data.results || res.data))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(fetchRegions, [fetchRegions]);

  const handleRegionRenamed = (updated) => {
    fetchRegions();
    if (selectedRegion?.id === updated.id) setSelectedRegion(updated);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Location Management</h1>
      <p className="text-sm text-gray-500 mb-6">Manage Regions, Zones, Special Woredas, Woredas, and Kebeles.</p>

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
// Reusable inline-editable row
// ---------------------------------------------------------------

function EditableRow({ item, onSelect, onSave, onDelete, deleteWarning }) {
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
      setError('Name is required.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const updated = await onSave(item, name.trim());
      setIsEditing(false);
      if (updated) item.name = updated.name;
    } catch (err) {
      setError(err.response?.data?.errors?.name?.[0] || 'Failed to rename.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(deleteWarning || `Delete "${item.name}"?`)) return;
    await onDelete(item);
  };

  if (isEditing) {
    return (
      <li className="py-2.5">
        <div className="flex gap-2 items-center">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-2.5 py-1 rounded"
          >
            {isSaving ? '...' : 'Save'}
          </button>
          <button onClick={cancelEdit} className="text-xs text-gray-500 hover:text-gray-700 px-1">
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </li>
    );
  }

  return (
    <li className="py-2.5 flex justify-between items-center group">
      {onSelect ? (
        <button onClick={() => onSelect(item)} className="text-sm text-gray-800 hover:text-primary-700 font-medium">
          {item.name}
        </button>
      ) : (
        <span className="text-sm text-gray-800">{item.name}</span>
      )}
      <div className="flex gap-3">
        <button onClick={startEdit} className="text-xs text-gray-500 hover:text-primary-700">
          Edit
        </button>
        <button onClick={handleDelete} className="text-xs text-red-600 hover:text-red-700">
          Delete
        </button>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------
// Reusable inline-editable page header (for detail-page titles)
// ---------------------------------------------------------------

function EditableHeader({ label, currentName, onSave }) {
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
      setError(err.response?.data?.errors?.name?.[0] || `Failed to rename ${label}.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm font-semibold"
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-2.5 py-1 rounded"
            >
              {isSaving ? '...' : 'Save'}
            </button>
            <button onClick={() => { setIsEditing(false); setError(''); }} className="text-xs text-gray-500">
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2 className="font-semibold text-gray-800">{currentName}</h2>
            <button
              onClick={() => { setDraft(currentName); setIsEditing(true); }}
              className="text-xs text-gray-500 hover:text-primary-700"
            >
              Edit
            </button>
          </>
        )}
      </div>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}

// ---------------------------------------------------------------
// Regions
// ---------------------------------------------------------------

function RegionList({ regions, isLoading, onSelect, onChanged }) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await locationAdminService.createRegion({ name });
      setName('');
      setShowCreate(false);
      onChanged();
    } catch (err) {
      setError(err.response?.data?.errors?.name?.[0] || 'Failed to create Region.');
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800">Regions</h2>
        <Button className="w-auto px-4" onClick={() => setShowCreate((s) => !s)}>
          {showCreate ? 'Cancel' : '+ Add Region'}
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-4">
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="flex-1">
              <TextField label="Region Name" value={name} onChange={setName} error={error} />
            </div>
            <Button type="submit" className="w-auto px-4" isLoading={isSubmitting}>Add</Button>
          </form>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Loading regions..." />
        ) : regions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No regions yet.</p>
        ) : (
          <ul className="divide-y">
            {regions.map((r) => (
              <EditableRow
                key={r.id}
                item={r}
                onSelect={onSelect}
                onSave={handleRename}
                onDelete={handleDelete}
                deleteWarning={`Delete Region "${r.name}"? This will also delete its Zones, Special Woredas, Woredas, and Kebeles.`}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------
// Region Detail: Zones + Special Woredas within a Region
// ---------------------------------------------------------------

function RegionDetail({ region, onBack, onSelectZone, onSelectSpecialWoreda, onRegionRenamed }) {
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
      .finally(() => setIsLoading(false));
  }, [region.id]);

  useEffect(fetchChildren, [fetchChildren]);

  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      await locationAdminService.createZone({ name: zoneForm.name, region: region.id });
      setZoneForm({ show: false, name: '', error: '' });
      fetchChildren();
    } catch (err) {
      setZoneForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || 'Failed to add Zone.' }));
    }
  };

  const handleAddSpecialWoreda = async (e) => {
    e.preventDefault();
    try {
      await locationAdminService.createSpecialWoreda({ name: swForm.name, region: region.id });
      setSwForm({ show: false, name: '', error: '' });
      fetchChildren();
    } catch (err) {
      setSwForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || 'Failed to add Special Woreda.' }));
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
    <div>
      <button onClick={onBack} className="text-sm text-primary-600 hover:text-primary-700 mb-4">
        ← Back to Regions
      </button>

      <EditableHeader label="Region" currentName={region.name} onSave={handleRenameRegion} />

      {isLoading ? (
        <LoadingSpinner message="Loading..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zones */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Zones</h3>
              <button
                onClick={() => setZoneForm((p) => ({ ...p, show: !p.show }))}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {zoneForm.show ? 'Cancel' : '+ Add Zone'}
              </button>
            </div>

            {zoneForm.show && (
              <form onSubmit={handleAddZone} className="flex gap-2 mb-3">
                <input
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm((p) => ({ ...p, name: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                  placeholder="Zone name"
                />
                <button type="submit" className="text-xs bg-primary-600 text-white px-3 rounded-md">Add</button>
              </form>
            )}
            {zoneForm.error && <Alert variant="error">{zoneForm.error}</Alert>}

            <Card>
              {zones.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No zones yet.</p>
              ) : (
                <ul className="divide-y">
                  {zones.map((z) => (
                    <EditableRow
                      key={z.id}
                      item={z}
                      onSelect={onSelectZone}
                      onSave={handleRenameZone}
                      onDelete={handleDeleteZone}
                      deleteWarning={`Delete Zone "${z.name}"? This will also delete its Woredas and Kebeles.`}
                    />
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Special Woredas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Special Woredas</h3>
              <button
                onClick={() => setSwForm((p) => ({ ...p, show: !p.show }))}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {swForm.show ? 'Cancel' : '+ Add Special Woreda'}
              </button>
            </div>

            {swForm.show && (
              <form onSubmit={handleAddSpecialWoreda} className="flex gap-2 mb-3">
                <input
                  value={swForm.name}
                  onChange={(e) => setSwForm((p) => ({ ...p, name: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                  placeholder="Special Woreda name"
                />
                <button type="submit" className="text-xs bg-primary-600 text-white px-3 rounded-md">Add</button>
              </form>
            )}
            {swForm.error && <Alert variant="error">{swForm.error}</Alert>}

            <Card>
              {specialWoredas.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No special woredas yet.</p>
              ) : (
                <ul className="divide-y">
                  {specialWoredas.map((sw) => (
                    <EditableRow
                      key={sw.id}
                      item={sw}
                      onSelect={onSelectSpecialWoreda}
                      onSave={handleRenameSpecialWoreda}
                      onDelete={handleDeleteSpecialWoreda}
                      deleteWarning={`Delete Special Woreda "${sw.name}"? This will also delete its Kebeles.`}
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
// Zone Detail: Woredas within a Zone
// ---------------------------------------------------------------

function ZoneDetail({ zone, onBack, onSelectWoreda, onZoneRenamed }) {
  const [woredas, setWoredas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ show: false, name: '', error: '' });

  const fetchWoredas = useCallback(() => {
    setIsLoading(true);
    locationAdminService
      .listWoredas(zone.id)
      .then((res) => setWoredas(res.data.results || res.data))
      .finally(() => setIsLoading(false));
  }, [zone.id]);

  useEffect(fetchWoredas, [fetchWoredas]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await locationAdminService.createWoreda({ name: form.name, zone: zone.id });
      setForm({ show: false, name: '', error: '' });
      fetchWoredas();
    } catch (err) {
      setForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || 'Failed to add Woreda.' }));
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
    <div>
      <button onClick={onBack} className="text-sm text-primary-600 hover:text-primary-700 mb-4">
        ← Back to Region
      </button>

      <EditableHeader label="Zone" currentName={zone.name} onSave={handleRenameZone} />

      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">Woredas</span>
        <button
          onClick={() => setForm((p) => ({ ...p, show: !p.show }))}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          {form.show ? 'Cancel' : '+ Add Woreda'}
        </button>
      </div>

      {form.show && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            placeholder="Woreda name"
          />
          <button type="submit" className="text-xs bg-primary-600 text-white px-3 rounded-md">Add</button>
        </form>
      )}
      {form.error && <Alert variant="error">{form.error}</Alert>}

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Loading woredas..." />
        ) : woredas.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No woredas yet.</p>
        ) : (
          <ul className="divide-y">
            {woredas.map((w) => (
              <EditableRow
                key={w.id}
                item={w}
                onSelect={onSelectWoreda}
                onSave={handleRenameWoreda}
                onDelete={handleDelete}
                deleteWarning={`Delete Woreda "${w.name}"? This will also delete its Kebeles.`}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------
// Woreda Detail: Kebeles within a Woreda
// ---------------------------------------------------------------

function WoredaDetail({ woreda, onBack, onWoredaRenamed }) {
  const [kebeles, setKebeles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ show: false, name: '', error: '' });

  const fetchKebeles = useCallback(() => {
    setIsLoading(true);
    locationAdminService
      .listKebelesByWoreda(woreda.id)
      .then((res) => setKebeles(res.data.results || res.data))
      .finally(() => setIsLoading(false));
  }, [woreda.id]);

  useEffect(fetchKebeles, [fetchKebeles]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await locationAdminService.createKebele({ name: form.name, woreda: woreda.id });
      setForm({ show: false, name: '', error: '' });
      fetchKebeles();
    } catch (err) {
      setForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || 'Failed to add Kebele.' }));
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
    <div>
      <button onClick={onBack} className="text-sm text-primary-600 hover:text-primary-700 mb-4">
        ← Back to Zone
      </button>

      <EditableHeader label="Woreda" currentName={woreda.name} onSave={handleRenameWoreda} />

      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">Kebeles</span>
        <button
          onClick={() => setForm((p) => ({ ...p, show: !p.show }))}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          {form.show ? 'Cancel' : '+ Add Kebele'}
        </button>
      </div>

      {form.show && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            placeholder="Kebele name"
          />
          <button type="submit" className="text-xs bg-primary-600 text-white px-3 rounded-md">Add</button>
        </form>
      )}
      {form.error && <Alert variant="error">{form.error}</Alert>}

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Loading kebeles..." />
        ) : kebeles.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No kebeles yet.</p>
        ) : (
          <ul className="divide-y">
            {kebeles.map((k) => (
              <EditableRow
                key={k.id}
                item={k}
                onSave={handleRenameKebele}
                onDelete={handleDelete}
                deleteWarning={`Delete Kebele "${k.name}"?`}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------
// Special Woreda Detail: Kebeles within a Special Woreda
// ---------------------------------------------------------------

function SpecialWoredaDetail({ specialWoreda, onBack, onSpecialWoredaRenamed }) {
  const [kebeles, setKebeles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ show: false, name: '', error: '' });

  const fetchKebeles = useCallback(() => {
    setIsLoading(true);
    locationAdminService
      .listKebelesBySpecialWoreda(specialWoreda.id)
      .then((res) => setKebeles(res.data.results || res.data))
      .finally(() => setIsLoading(false));
  }, [specialWoreda.id]);

  useEffect(fetchKebeles, [fetchKebeles]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await locationAdminService.createKebele({ name: form.name, special_woreda: specialWoreda.id });
      setForm({ show: false, name: '', error: '' });
      fetchKebeles();
    } catch (err) {
      setForm((p) => ({ ...p, error: err.response?.data?.errors?.name?.[0] || 'Failed to add Kebele.' }));
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
    <div>
      <button onClick={onBack} className="text-sm text-primary-600 hover:text-primary-700 mb-4">
        ← Back to Region
      </button>

      <EditableHeader label="Special Woreda" currentName={specialWoreda.name} onSave={handleRenameSpecialWoreda} />

      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-700">Kebeles</span>
        <button
          onClick={() => setForm((p) => ({ ...p, show: !p.show }))}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          {form.show ? 'Cancel' : '+ Add Kebele'}
        </button>
      </div>

      {form.show && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            placeholder="Kebele name"
          />
          <button type="submit" className="text-xs bg-primary-600 text-white px-3 rounded-md">Add</button>
        </form>
      )}
      {form.error && <Alert variant="error">{form.error}</Alert>}

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Loading kebeles..." />
        ) : kebeles.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No kebeles yet.</p>
        ) : (
          <ul className="divide-y">
            {kebeles.map((k) => (
              <EditableRow
                key={k.id}
                item={k}
                onSave={handleRenameKebele}
                onDelete={handleDelete}
                deleteWarning={`Delete Kebele "${k.name}"?`}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default AdminLocationManagementPage;
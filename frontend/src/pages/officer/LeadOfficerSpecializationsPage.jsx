import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import specializationService from '../../api/specializationService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function LeadOfficerSpecializationsPage() {
  const { t } = useTranslation();
  const [kebele, setKebele] = useState(null);
  const [checkingLead, setCheckingLead] = useState(true);

  const [specializations, setSpecializations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [assignOfficerId, setAssignOfficerId] = useState('');
  const [assignSpecId, setAssignSpecId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      setCheckingLead(true);
      try {
        const data = await specializationService.getMyLeadKebele();
        setKebele(data.lead_officer ? {
          id: data.lead_officer.kebele_id,
          name: data.lead_officer.kebele_name,
        } : null);
      } catch (err) {
        setError('Failed to check Lead Officer status.');
      } finally {
        setCheckingLead(false);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    if (!kebele) return;
    setLoadingData(true);
    setError('');
    try {
      const [specs, elig] = await Promise.all([
        specializationService.listSpecializations(kebele.id),
        specializationService.getEligibleOfficers(kebele.id),
      ]);
      setSpecializations(specs);
      setOfficers(elig);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load specialization data.');
    } finally {
      setLoadingData(false);
    }
  }, [kebele]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Please enter a specialization name.');
      return;
    }
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      await specializationService.createSpecialization(kebele.id, {
        name: newName.trim(),
        description: newDescription.trim(),
      });
      setNewName('');
      setNewDescription('');
      setSuccess('Specialization created.');
      loadData();
    } catch (err) {
      const errors = err.response?.data?.errors || err.response?.data;
      const message =
        (errors?.name && errors.name[0]) ||
        err.response?.data?.detail ||
        'Failed to create specialization.';
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (spec) => {
    setError('');
    try {
      await specializationService.toggleActive(kebele.id, spec.id, !spec.is_active);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update specialization.');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignOfficerId || !assignSpecId) {
      setError('Select both an officer and a specialization.');
      return;
    }
    setAssigning(true);
    setError('');
    setSuccess('');
    try {
      await specializationService.assignOfficerSpecialization(
        kebele.id,
        Number(assignOfficerId),
        Number(assignSpecId)
      );
      setSuccess('Specialization assigned to officer.');
      setAssignOfficerId('');
      setAssignSpecId('');
      loadData();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data) ? err.response.data[0] : null) ||
        'Failed to assign specialization.';
      setError(detail);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveOfficerSpec = async (officerSpecId) => {
    if (!window.confirm('Remove this specialization from the officer?')) return;
    setError('');
    try {
      await specializationService.removeOfficerSpecialization(kebele.id, officerSpecId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove.');
    }
  };

  if (checkingLead) {
    return <LoadingSpinner fullScreen message={t('checking_lead_status', "Checking Lead Officer status...")} />;
  }

  if (!kebele) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="error">
          {t('not_lead_officer', "You are not currently designated as a Lead Officer for any Kebele.")}
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('specialization_management', 'Specialization Management')}</h1>
        <p className="text-sm text-gray-500">{t('lead_officer_for', 'Lead Officer for')} {kebele.name}</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Create Specialization */}
      <Card>
        <h2 className="text-lg font-medium mb-3">{t('add_professional_specialization', 'Add Professional Specialization')}</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('spec_name', 'Name')}</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('spec_name_placeholder', 'e.g. Plant Science & Crop Production Officers')}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('spec_description', 'Description (optional)')}
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder={t('spec_description_placeholder', 'Short description of this specialty')}
              autoComplete="off"
            />
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? t('adding', 'Adding...') : t('add_specialization', 'Add Specialization')}
          </Button>
        </form>
      </Card>

      {/* Specialization List */}
      <Card>
        <h2 className="text-lg font-medium mb-3">
          {t('specializations_in', 'Specializations in {{kebele}}', { kebele: kebele.name })} ({specializations.length})
        </h2>
        {loadingData ? (
          <LoadingSpinner />
        ) : specializations.length === 0 ? (
          <p className="text-gray-500 italic">{t('no_specs_created', 'No specializations created yet.')}</p>
        ) : (
          <ul className="divide-y">
            {specializations.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {s.name}{' '}
                    <span
                      className={`text-xs px-2 py-0.5 rounded ml-2 ${
                        s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {s.is_active ? t('active', 'Active') : t('inactive', 'Inactive')}
                    </span>
                  </p>
                  {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
                  <p className="text-xs text-gray-400">{t('officers_assigned_count', '{{count}} officer(s) assigned', { count: s.officer_count })}</p>
                </div>
                <Button variant="secondary" onClick={() => handleToggleActive(s)}>
                  {s.is_active ? t('deactivate', 'Deactivate') : t('activate', 'Activate')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Assign Officer to Specialization */}
      <Card>
        <h2 className="text-lg font-medium mb-3">{t('assign_officer_to_spec', 'Assign Officer to Specialization')}</h2>
        <form onSubmit={handleAssign} className="space-y-3">
          <select
            className="w-full border rounded p-2"
            value={assignOfficerId}
            onChange={(e) => setAssignOfficerId(e.target.value)}
          >
            <option value="">{t('select_officer', '-- Select an officer --')}</option>
            {officers.map((o) => (
              <option key={o.officer_id} value={o.officer_id}>
                {o.officer_full_name} ({o.officer_email})
              </option>
            ))}
          </select>
          <select
            className="w-full border rounded p-2"
            value={assignSpecId}
            onChange={(e) => setAssignSpecId(e.target.value)}
          >
            <option value="">{t('select_specialization', '-- Select a specialization --')}</option>
            {specializations.filter((s) => s.is_active).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={assigning}>
            {assigning ? t('assigning', 'Assigning...') : t('assign', 'Assign')}
          </Button>
        </form>
      </Card>

      {/* Officers & their current specializations */}
      <Card>
        <h2 className="text-lg font-medium mb-3">{t('officers_in', 'Officers in {{kebele}}', { kebele: kebele.name })}</h2>
        {officers.length === 0 ? (
          <p className="text-gray-500 italic">{t('no_officers_assigned', 'No officers assigned to this Kebele.')}</p>
        ) : (
          <ul className="divide-y">
            {officers.map((o) => (
              <li key={o.officer_id} className="py-3">
                <p className="font-medium">{o.officer_full_name}</p>
                <p className="text-sm text-gray-500 mb-1">{o.officer_email}</p>
                {o.specializations.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">{t('no_specs_assigned', 'No specializations assigned.')}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {o.specializations.map((spec) => (
                      <span
                        key={spec.id}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {spec.name}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
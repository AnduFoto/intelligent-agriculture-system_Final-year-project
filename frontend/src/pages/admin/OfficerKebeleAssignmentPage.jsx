import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/adminService';
import { locationAdminService } from '../../api/locationAdminService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

function OfficerKebeleAssignmentPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [officer, setOfficer] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [allKebeles, setAllKebeles] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const [detailKebeleId, setDetailKebeleId] = useState(null);

  const fetchAssigned = useCallback(() => {
    setIsLoading(true);
    setError('');
    adminService
      .listOfficerKebeles(id)
      .then((res) => {
        setOfficer(res.data);
        setAssigned(res.data.assigned_kebeles || []);
      })
      .catch((err) => setError(err.response?.data?.detail || t('failed_to_load_officer', 'Could not load this Officer.')))
      .finally(() => setIsLoading(false));
  }, [id, t]);

  const fetchAllKebeles = useCallback(() => {
    setIsLoadingAll(true);
    locationAdminService
      .searchKebeles('')
      .then((res) => setAllKebeles(res.data.results || res.data))
      .catch(() => setAllKebeles([]))
      .finally(() => setIsLoadingAll(false));
  }, []);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  useEffect(() => {
    fetchAllKebeles();
  }, [fetchAllKebeles]);

  const assignedIds = new Set(assigned.map((k) => k.id));

  const visibleKebeles = allKebeles.filter((k) => {
    if (!searchTerm.trim()) return true;
    return k.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  const handleAssign = async (kebele) => {
    setActionError('');
    setActionMessage('');
    try {
      await adminService.assignOfficerKebeles(id, [kebele.id]);
      setActionMessage(`"${kebele.name}" assigned successfully.`);
      fetchAssigned();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to assign Kebele.');
    }
  };

  const officerInitials = officer
    ? (officer.full_name || `${officer.first_name || ''} ${officer.last_name || ''}` || officer.email || 'O')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'O';

  if (isLoading) {
    return (
      <div className="py-24 ml-4 flex flex-col items-center justify-center space-y-4 max-w-5xl mx-auto">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Loading Officer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 py-8">
        <Alert variant="error">{error}</Alert>
        <button
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4" />
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      <div>
        <button
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors py-1 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Users</span>
        </button>
      </div>

      {/* Officer Showcase Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base shadow-sm bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shrink-0">
              {officerInitials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                  {officer?.first_name} {officer?.last_name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  <ShieldCheck className="w-3 h-3" />
                  Agriculture Officer
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  {assigned.length} Kebeles Assigned
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                  {officer?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}
      {actionMessage && <Alert variant="success">{actionMessage}</Alert>}

      {/* Currently Assigned Kebeles */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          Currently Assigned Kebeles ({assigned.length})
        </h2>

        {assigned.length === 0 ? (
          <Card className="py-12 text-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <MapPin className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">No Kebeles assigned yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {assigned.map((k) => {
              const isDetailOpen = detailKebeleId === k.id;
              const woredaLabel = k.woreda_name || k.special_woreda_name;

              return (
                <div
                  key={k.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/40 font-bold">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800 dark:text-white text-base">
                            {k.name}
                          </h3>
                          {woredaLabel && (
                            <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                              {woredaLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDetailKebeleId(isDetailOpen ? null : k.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isDetailOpen ? 'Hide Team' : 'Coverage Team'}</span>
                      {isDetailOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isDetailOpen && (
                    <div className="border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-950/40 p-4 sm:p-5">
                      <KebeleDetailPanel
                        kebele={k}
                        currentOfficerId={id}
                        onChanged={fetchAssigned}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Kebeles to Assign */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                All Available Kebeles
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Assign additional kebeles to this officer's coverage.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter kebeles by name..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>

        {isLoadingAll ? (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading kebeles...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 max-h-96 overflow-y-auto">
            {visibleKebeles.map((k) => (
              <div key={k.id} className="p-3.5 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white">
                  {k.name} <span className="text-xs text-slate-400 font-normal">({k.woreda_name || k.special_woreda_name})</span>
                </span>
                {assignedIds.has(k.id) ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                    Assigned
                  </span>
                ) : (
                  <button
                    onClick={() => handleAssign(k)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors"
                  >
                    + Assign
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function KebeleDetailPanel({ kebele, currentOfficerId, onChanged }) {
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAssignNew, setShowAssignNew] = useState(false);
  const [allOfficers, setAllOfficers] = useState([]);
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(false);
  const [officerSearch, setOfficerSearch] = useState('');
  const [assignError, setAssignError] = useState('');

  const fetchAssignedOfficers = useCallback(() => {
    setIsLoading(true);
    adminService
      .getKebeleOfficers(kebele.id)
      .then((res) => setOfficers(res.data))
      .catch(() => setError('Could not load assigned officers.'))
      .finally(() => setIsLoading(false));
  }, [kebele.id]);

  useEffect(fetchAssignedOfficers, [fetchAssignedOfficers]);

  const openAssignNew = () => {
    setShowAssignNew(true);
    setIsLoadingOfficers(true);
    adminService
      .listUsers({ role: 'OFFICER' })
      .then((res) => setAllOfficers(res.data.results || res.data))
      .catch(() => setAllOfficers([]))
      .finally(() => setIsLoadingOfficers(false));
  };

  const assignedOfficerIds = new Set(officers.map((o) => o.officer_id));

  const visibleOfficers = allOfficers.filter((o) => {
    if (!officerSearch.trim()) return true;
    const term = officerSearch.trim().toLowerCase();
    return (o.full_name || '').toLowerCase().includes(term) || o.email.toLowerCase().includes(term);
  });

  const handleRemoveOfficer = async (officerId) => {
    if (!window.confirm('Remove this Officer from the Kebele?')) return;
    setError('');
    try {
      await adminService.removeOfficerKebele(officerId, kebele.id);
      fetchAssignedOfficers();
      onChanged();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove.');
    }
  };

  const handleAssignNew = async (officer) => {
    setAssignError('');
    try {
      await adminService.assignOfficerKebeles(officer.id, [kebele.id]);
      setShowAssignNew(false);
      fetchAssignedOfficers();
      onChanged();
    } catch (err) {
      setAssignError(err.response?.data?.detail || 'Failed to assign.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          Officers assigned to "{kebele.name}"
        </h4>
        {!showAssignNew && (
          <button
            onClick={openAssignNew}
            className="text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            + Assign to another Officer
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

      {isLoading ? (
        <div className="py-4 text-center">
          <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : officers.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No officers currently assigned.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {officers.map((o) => (
            <div key={o.officer_id} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-white">
                  {o.officer_name} {String(o.officer_id) === String(currentOfficerId) && <span className="text-primary-600 font-normal">(this officer)</span>}
                </span>
                <button onClick={() => handleRemoveOfficer(o.officer_id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{o.officer_email}</p>
            </div>
          ))}
        </div>
      )}

      {showAssignNew && (
        <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Select Officer</span>
            <button onClick={() => setShowAssignNew(false)} className="text-xs text-slate-400">Cancel</button>
          </div>
          <input
            value={officerSearch}
            onChange={(e) => setOfficerSearch(e.target.value)}
            placeholder="Search officers..."
            className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
          />
          {assignError && <p className="text-xs text-red-500">{assignError}</p>}
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-36 overflow-y-auto">
            {visibleOfficers.map((o) => (
              <div key={o.id} className="py-1.5 flex items-center justify-between text-xs">
                <span>{o.full_name}</span>
                {assignedOfficerIds.has(o.id) ? (
                  <span className="text-slate-400 text-[11px]">Assigned</span>
                ) : (
                  <button onClick={() => handleAssignNew(o)} className="text-primary-600 font-bold">Assign</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficerKebeleAssignmentPage;
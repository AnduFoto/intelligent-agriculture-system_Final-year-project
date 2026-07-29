import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import { locationAdminService } from '../../api/locationAdminService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function OfficerAssignKebelePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [officer, setOfficer] = useState(null);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [allKebeles, setAllKebeles] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchOfficer = useCallback(() => {
    setIsLoading(true);
    setError('');
    adminService
      .listOfficerKebeles(id)
      .then((res) => {
        setOfficer(res.data);
        setAssignedIds(new Set((res.data.assigned_kebeles || []).map((k) => k.id)));
      })
      .catch((err) => setError(err.response?.data?.detail || 'Could not load this Officer.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const fetchAllKebeles = useCallback(() => {
    setIsLoadingAll(true);
    locationAdminService
      .searchKebeles('')
      .then((res) => setAllKebeles(res.data.results || res.data))
      .catch(() => setAllKebeles([]))
      .finally(() => setIsLoadingAll(false));
  }, []);

  useEffect(fetchOfficer, [fetchOfficer]);
  useEffect(fetchAllKebeles, [fetchAllKebeles]);

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
      fetchOfficer();
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Failed to assign Kebele.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading Officer..." />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate('/admin/users')} className="text-sm text-primary-600 hover:text-primary-700">
          ← Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(`/admin/users/${id}/kebeles`)}
        className="text-sm text-primary-600 hover:text-primary-700 mb-4"
      >
        ← Back to Assigned Kebeles
      </button>

      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Assign Kebele</h1>
      <p className="text-sm text-gray-500 mb-6">
        {officer?.first_name} {officer?.last_name} — {officer?.email}
      </p>

      <Alert variant="success">{actionMessage}</Alert>
      <Alert variant="error">{actionError}</Alert>

      <Card>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by name (optional)..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
        />

        {isLoadingAll ? (
          <LoadingSpinner message="Loading kebeles..." />
        ) : visibleKebeles.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            {searchTerm ? `No Kebeles found matching "${searchTerm}".` : 'No Kebeles exist yet.'}
          </p>
        ) : (
          <ul className="divide-y border border-gray-200 rounded-md max-h-[28rem] overflow-y-auto">
            {visibleKebeles.map((k) => (
              <li key={k.id} className="px-3 py-2 flex items-center justify-between text-sm">
                <span>
                  {k.name}{' '}
                  <span className="text-gray-400 text-xs">
                    ({k.woreda_name || k.special_woreda_name})
                  </span>
                </span>
                {assignedIds.has(k.id) ? (
                  <span className="text-xs text-gray-400">Already assigned</span>
                ) : (
                  <button
                    onClick={() => handleAssign(k)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Assign
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default OfficerAssignKebelePage;
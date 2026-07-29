import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function OfficerListPage() {
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService
      .listUsers({ role: 'OFFICER' })
      .then((res) => setOfficers(res.data.results || res.data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Officer Kebele Assignments</h1>
      <p className="text-sm text-gray-500 mb-6">
        Select an Agriculture Officer to manage their assigned Kebeles.
      </p>

      <Card>
        {isLoading ? (
          <LoadingSpinner message="Loading officers..." />
        ) : officers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No Officer accounts exist yet.</p>
        ) : (
          <ul className="divide-y">
            {officers.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{o.full_name}</p>
                  <p className="text-xs text-gray-500">{o.email}</p>
                </div>
                <Link
                  to={`/admin/users/${o.id}/kebeles`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Manage Kebeles →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default OfficerListPage;
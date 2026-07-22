import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">
        Welcome, {user?.first_name}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage users, locations, and oversee the platform.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/users">
          <Card className="hover:shadow-md transition h-full">
            <h3 className="font-semibold text-gray-800 mb-1">User Management</h3>
            <p className="text-sm text-gray-500">
              Create, view, and manage Farmer, Officer, and Administrator accounts.
            </p>
          </Card>
        </Link>

        <Link to="/admin/locations">
          <Card className="hover:shadow-md transition h-full">
            <h3 className="font-semibold text-gray-800 mb-1">Location Management</h3>
            <p className="text-sm text-gray-500">
              Manage Regions, Zones, Special Woredas, and Woredas.
            </p>
          </Card>
        </Link>

        <Card className="h-full">
          <h3 className="font-semibold text-gray-800 mb-1">System Analytics</h3>
          <p className="text-sm text-gray-500 mb-3">
            View platform-wide usage and activity reports.
          </p>
          <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
            Coming soon
          </span>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
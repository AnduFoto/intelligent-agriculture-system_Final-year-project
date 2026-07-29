import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';
function OfficerDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">
        Welcome, {user?.first_name}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Here's an overview of your responsibilities.
      </p>
      <Link to="/officer/my-kebeles">
        <Card className="hover:shadow-md transition h-full">
          <h3 className="font-semibold text-gray-800 mb-1">My Assigned Kebeles</h3>
          <p className="text-sm text-gray-500">View the Kebeles you currently cover.</p>
        </Card>
      </Link>

      <Link to="/officer/predict">
        <Card className="hover:shadow-md transition h-full">
          <h3 className="font-semibold text-gray-800 mb-1">Crop Disease Detection</h3>
          <p className="text-sm text-gray-500">Upload a crop image to get an AI-powered diagnosis.</p>
        </Card>
      </Link>


      <Link to="/officer/browse/kebeles">
        <Card className="hover:shadow-md transition h-full">
          <h3 className="font-semibold text-gray-800 mb-1">Browse Farmer Predictions</h3>
          <p className="text-sm text-gray-500">Explore prediction activity by Kebele.</p>
        </Card>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Consultation Requests"
          description="View and respond to farmer consultation requests."
          note="Coming soon"
        />
        <DashboardCard
          title="Publish Farming Tips"
          description="Share fertilizer, seasonal, and crop management advice."
          note="Coming soon"
        />
        <DashboardCard
          title="Educational Content"
          description="Author articles and guides for farmers."
          note="Coming soon"
        />
        <DashboardCard
          title="Content Moderation"
          description="Moderate community posts and discussions."
          note="Coming soon"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, description, note }) {
  return (
    <Card className="hover:shadow-md transition">
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      {note && (
        <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
          {note}
        </span>
      )}
    </Card>
  );
}

export default OfficerDashboard;
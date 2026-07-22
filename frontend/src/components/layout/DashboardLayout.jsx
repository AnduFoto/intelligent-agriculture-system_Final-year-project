import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
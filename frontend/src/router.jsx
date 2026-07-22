import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import RegistrationPage from './pages/RegistrationPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';

import FarmerDashboard from './pages/farmer/FarmerDashboard';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage';
import AdminLocationManagementPage from './pages/admin/AdminLocationManagementPage';

import {
  
  NotFoundPage,
} from './pages/placeholders';

const router = createBrowserRouter([
  // ---------- Public routes ----------
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegistrationPage /> },
  { path: '/verify-email/:token', element: <EmailVerificationPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password/:token', element: <ResetPasswordPage /> },

  // ---------- Authenticated routes (any role) — with Navbar ----------
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/profile', element: <ProfilePage /> },

          // ---------- Farmer-only ----------
          {
            element: <RoleBasedRoute allowedRoles={['FARMER']} />,
            children: [
              { path: '/farmer/dashboard', element: <FarmerDashboard /> },
            ],
          },

          // ---------- Officer-only ----------
          {
            element: <RoleBasedRoute allowedRoles={['OFFICER']} />,
            children: [
              { path: '/officer/dashboard', element: <OfficerDashboard /> },
            ],
          },

          // ---------- Administrator-only ----------
          {
            element: <RoleBasedRoute allowedRoles={['ADMINISTRATOR']} />,
            children: [
              { path: '/admin/dashboard', element: <AdminDashboard /> },
              { path: '/admin/users', element: <AdminUserManagementPage /> },
              { path: '/admin/locations', element: <AdminLocationManagementPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ---------- Root redirect & fallback ----------
  { path: '/', element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
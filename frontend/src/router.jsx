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
import DiseaseDetectionPage from './pages/farmer/DiseaseDetectionPage';

import PredictionHistoryPage from './pages/farmer/PredictionHistoryPage';
import PredictionDetailPage from './pages/farmer/PredictionDetailPage';
// import OfficerKebeleAssignmentPage from './pages/admin/OfficerKebeleAssignmentPage';
import OfficerListPage from './pages/admin/OfficerListPage';
import OfficerAssignedKebelesPage from './pages/admin/OfficerAssignedKebelesPage';
import OfficerAssignKebelePage from './pages/admin/OfficerAssignKebelePage';
import MyKebelesPage from './pages/officer/MyKebelesPage';
import KebeleBrowsePage from './pages/shared/KebeleBrowsePage';
import CropBrowsePage from './pages/shared/CropBrowsePage';
import FarmerBrowsePage from './pages/shared/FarmerBrowsePage';
import FarmerHistoryBrowsePage from './pages/shared/FarmerHistoryBrowsePage';

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
                { path: '/farmer/predict', element: <DiseaseDetectionPage /> },
                { path: '/farmer/predictions', element: <PredictionHistoryPage /> },
                { path: '/farmer/predictions/:id', element: <PredictionDetailPage /> },
              ],    
          },

          // ---------- Officer-only ----------
         {
        element: <RoleBasedRoute allowedRoles={['OFFICER']} />,
        children: [
          { path: '/officer/dashboard', element: <OfficerDashboard /> },
          { path: '/officer/my-kebeles', element: <MyKebelesPage /> },
          { path: '/officer/predict', element: <DiseaseDetectionPage /> },
          { path: '/officer/predictions', element: <PredictionHistoryPage /> },
          { path: '/officer/predictions/:id', element: <PredictionDetailPage /> },
          { path: '/officer/browse/kebeles', element: <KebeleBrowsePage /> },
          { path: '/officer/browse/kebeles/:kebeleId', element: <CropBrowsePage /> },
          { path: '/officer/browse/kebeles/:kebeleId/crops/:crop', element: <FarmerBrowsePage /> },
          { path: '/officer/browse/farmers/:farmerId', element: <FarmerHistoryBrowsePage /> },
                  ],

      },

          // ---------- Administrator-only ----------
          {
            element: <RoleBasedRoute allowedRoles={['ADMINISTRATOR']} />,
            children: [
              { path: '/admin/dashboard', element: <AdminDashboard /> },
              { path: '/admin/users', element: <AdminUserManagementPage /> },
              { path: '/admin/locations', element: <AdminLocationManagementPage /> },
              // { path: '/admin/users/:id/kebeles', element: <OfficerKebeleAssignmentPage /> },
              { path: '/admin/officers', element: <OfficerListPage /> },
              { path: '/admin/users/:id/kebeles', element: <OfficerAssignedKebelesPage /> },
              { path: '/admin/users/:id/kebeles/assign', element: <OfficerAssignKebelePage /> },
              { path: '/admin/predict', element: <DiseaseDetectionPage /> },
              { path: '/admin/predictions', element: <PredictionHistoryPage /> },
              { path: '/admin/predictions/:id', element: <PredictionDetailPage /> },  
              { path: '/admin/browse/kebeles', element: <KebeleBrowsePage /> },
              { path: '/admin/browse/kebeles/:kebeleId', element: <CropBrowsePage /> },
              { path: '/admin/browse/kebeles/:kebeleId/crops/:crop', element: <FarmerBrowsePage /> },
              { path: '/admin/browse/farmers/:farmerId', element: <FarmerHistoryBrowsePage /> },  
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
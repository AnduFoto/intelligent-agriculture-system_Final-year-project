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
import AdminLeadOfficerPage from './pages/admin/AdminLeadOfficerPage';
import LeadOfficerSpecializationsPage from './pages/officer/LeadOfficerSpecializationsPage';
import AdminCropMappingPage from './pages/admin/AdminCropMappingPage';
import AdminCropTypesPage from './pages/admin/AdminCropTypesPage';
import NewConsultationPage from './pages/farmer/NewConsultationPage';
import MyConsultationsPage from './pages/farmer/MyConsultationsPage';
import ConsultationDetailPage from './pages/farmer/ConsultationDetailPage';
import AssignedConsultationsPage from './pages/officer/AssignedConsultationsPage';
import OfficerConsultationDetailPage from './pages/officer/OfficerConsultationDetailPage';
import LeadOfficerConsultationsPage from './pages/officer/LeadOfficerConsultationsPage';
import LeadOfficerConsultationDetailPage from './pages/officer/LeadOfficerConsultationDetailPage';

import ResourceLibraryPage from './pages/shared/ResourceLibraryPage';
import ResourceDetailPage from './pages/shared/ResourceDetailPage';
import PublisherProfilePage from './pages/shared/PublisherProfilePage';
import EducationDashboard from './pages/shared/EducationDashboard';
import ResourceEditorPage from './pages/shared/ResourceEditorPage';
import AdminWoredaEducationManagerPage from './pages/admin/AdminWoredaEducationManagerPage';
import LeadOfficerKebeleEducationManagerPage from './pages/officer/LeadOfficerKebeleEducationManagerPage';

import AdminReportsDashboard from './pages/admin/reports/AdminReportsDashboard';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminConsultationsPage from './pages/admin/AdminConsultationsPage';
import AdminEducationPage from './pages/admin/AdminEducationPage';
import LeadOfficerReportsDashboard from './pages/officer/reports/LeadOfficerReportsDashboard';
import OfficerReportsDashboard from './pages/officer/reports/OfficerReportsDashboard';
import FarmerReportsDashboard from './pages/farmer/reports/FarmerReportsDashboard';
import {
  
  NotFoundPage,
} from './pages/placeholders';

import SavedEducationalContentPage from './pages/shared/SavedEducationalContentPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import ChatPage from './pages/ChatPage';
import AdminChatReportsPage from './pages/admin/AdminChatReportsPage';
import HomePage from './pages/HomePage';
import AdminCommunityReportsPage from './pages/admin/AdminCommunityReportsPage';

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
          { path: '/home', element: <HomePage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/chat', element: <ChatPage /> },
          
          // ---------- Education (Shared) ----------
          { path: '/education/library', element: <ResourceLibraryPage /> },
          { path: '/education/saved', element: <SavedEducationalContentPage /> },
          { path: '/education/resources/:id', element: <ResourceDetailPage /> },
          { path: '/education/publishers/:id', element: <PublisherProfilePage /> },
          {
            element: <RoleBasedRoute allowedRoles={['ADMINISTRATOR', 'OFFICER']} />,
            children: [
                { path: '/education/manage', element: <EducationDashboard /> },
                { path: '/education/manage/new', element: <ResourceEditorPage /> },
                { path: '/education/manage/edit/:id', element: <ResourceEditorPage /> },
            ]
          },

          // ---------- Farmer-only ----------
          {

              element: <RoleBasedRoute allowedRoles={['FARMER']} />,
              children: [
                { path: '/farmer/dashboard', element: <FarmerDashboard /> },
                { path: '/farmer/predict', element: <DiseaseDetectionPage /> },
                { path: '/farmer/predictions', element: <PredictionHistoryPage /> },
                { path: '/farmer/predictions/:id', element: <PredictionDetailPage /> },

              {
                path: 'farmer/consultations',
                element: <MyConsultationsPage />,
              },
              {
                path: 'farmer/consultations/new',
                element: <NewConsultationPage />,
              },
              {
                path: 'farmer/consultations/:id',
                element: <ConsultationDetailPage />,
              },
              { path: '/farmer/reports', element: <FarmerReportsDashboard /> },
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
          {path: 'officer/specializations',element: <LeadOfficerSpecializationsPage />,},
          {path: 'officer/kebele-managers', element: <LeadOfficerKebeleEducationManagerPage />},
         

                {
                  path: 'officer/consultations',
                  element: <AssignedConsultationsPage />,
                },
                {
                  path: 'officer/consultations/:id',
                  element: <OfficerConsultationDetailPage />,
                },
                {
                path: 'officer/kebele-consultations',
                element: <LeadOfficerConsultationsPage />,
              },
              {
                path: 'officer/kebele-consultations/:id',
                element: <LeadOfficerConsultationDetailPage />,
              },
              { path: '/officer/reports', element: <OfficerReportsDashboard /> },
              { path: '/officer/lead-reports', element: <LeadOfficerReportsDashboard /> },
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
              {path: 'admin/lead-officers',element: <AdminLeadOfficerPage />,},
              {path: 'admin/crop-mapping', element: <AdminCropMappingPage />,},
              { path: 'admin/crop-types',element: <AdminCropTypesPage />,},
              { path: 'admin/woreda-managers', element: <AdminWoredaEducationManagerPage /> },
              { path: 'admin/activity', element: <AdminActivityPage /> },
              { path: 'admin/consultations', element: <AdminConsultationsPage /> },
              { path: 'admin/education', element: <AdminEducationPage /> },
              { path: '/admin/reports', element: <AdminReportsDashboard /> },
              { path: '/admin/chat-reports', element: <AdminChatReportsPage /> },
              { path: '/admin/community-reports', element: <AdminCommunityReportsPage /> },
              { path: '/dashboard/admin/chat-reports', element: <AdminChatReportsPage /> },

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
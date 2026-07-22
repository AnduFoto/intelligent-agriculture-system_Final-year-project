import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Restricts access to one or more specific roles. Must be nested
 * underneath a <ProtectedRoute> in the router config (Step 40) —
 * this component does NOT check isAuthenticated itself, since that
 * responsibility already belongs to ProtectedRoute and duplicating
 * it here would just add redundant logic to keep in sync.
 *
 * On a role mismatch, redirects to that user's OWN correct dashboard
 * rather than back to login (they are legitimately logged in — they
 * just don't belong on this particular page).
 *
 * Usage:
 *   <Route element={<RoleBasedRoute allowedRoles={['ADMINISTRATOR']} />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */
function RoleBasedRoute({ allowedRoles }) {
  const { role } = useAuth();

  const dashboardByRole = {
    FARMER: '/farmer/dashboard',
    OFFICER: '/officer/dashboard',
    ADMINISTRATOR: '/admin/dashboard',
  };

  if (!allowedRoles.includes(role)) {
    const fallbackPath = dashboardByRole[role] ?? '/login';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}

export default RoleBasedRoute;
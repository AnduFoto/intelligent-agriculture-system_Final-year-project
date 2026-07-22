import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps any route(s) that require the user to be authenticated,
 * regardless of role. Renders a loading state while AuthContext is
 * still restoring the session (see Step 37), to avoid a false
 * redirect-to-login flash for a user who is actually logged in.
 *
 * Preserves the originally requested location in state, so the
 * Login page can redirect back to it after a successful login
 * rather than always landing on a fixed default page.
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
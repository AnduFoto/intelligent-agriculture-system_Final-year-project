import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import { tokenStorage } from '../api/axiosInstance';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setIsSubmitting(true);

    try {
      await authService.resetPassword({
        token,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });

      // Clear any existing session — a password reset should always
      // require a fresh login, even if this browser happened to have
      // an old, still-valid session active.
      tokenStorage.clearTokens();

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ non_field_errors: [err.response?.data?.detail || 'Something went wrong.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold text-primary-700 mb-3">Password Reset</h2>
          <p className="text-sm text-gray-600">
            Your password has been reset successfully. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold text-primary-700 mb-1">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>

        {errors?.non_field_errors && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
            {errors.non_field_errors.join(' ')}
          </div>
        )}
        {errors?.token && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
            {errors.token[0]}{' '}
            <Link to="/forgot-password" className="underline font-medium">
              Request a new link
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors?.new_password && (
              <p className="text-xs text-red-600 mt-1">{errors.new_password.join(' ')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors?.confirm_new_password && (
              <p className="text-xs text-red-600 mt-1">{errors.confirm_new_password.join(' ')}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../api/authService';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.data.detail);
    } catch (err) {
      // The backend is designed to always succeed with a generic
      // message (email enumeration prevention) — an error here would
      // only realistically happen for a malformed email or network
      // failure, not "email not found."
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold text-primary-700 mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {message ? (
          <div className="p-3 bg-primary-50 text-primary-700 text-sm rounded">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-500 text-center mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
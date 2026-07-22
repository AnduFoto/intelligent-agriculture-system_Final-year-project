import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '../api/authService';

const STATUS = {
  VERIFYING: 'VERIFYING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

function EmailVerificationPage() {
  const { token } = useParams();
  const [status, setStatus] = useState(STATUS.VERIFYING);
  const [message, setMessage] = useState('');

  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(null);

  const hasAttempted = useRef(false);

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    authService
      .verifyEmail(token)
      .then((response) => {
        setStatus(STATUS.SUCCESS);
        setMessage(response.data.detail);
      })
      .catch((err) => {
        setStatus(STATUS.ERROR);
        setMessage(err.response?.data?.detail || 'Verification failed. The link may be invalid or expired.');
      });
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendStatus('SENDING');
    try {
      const response = await authService.resendVerification(resendEmail);
      setResendStatus(response.data.detail);
    } catch {
      setResendStatus('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
        {status === STATUS.VERIFYING && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Verifying your email...</h2>
            <p className="text-sm text-gray-500">Please wait a moment.</p>
          </>
        )}

        {status === STATUS.SUCCESS && (
          <>
            <h2 className="text-xl font-semibold text-primary-700 mb-3">Email Verified</h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Go to Login
            </Link>
          </>
        )}

        {status === STATUS.ERROR && (
          <>
            <h2 className="text-xl font-semibold text-red-600 mb-3">Verification Failed</h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>

            <form onSubmit={handleResend} className="space-y-3 text-left">
              <label className="block text-sm font-medium text-gray-700">
                Enter your email to receive a new verification link:
              </label>
              <input
                type="email"
                required
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                disabled={resendStatus === 'SENDING'}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2 rounded-md transition"
              >
                {resendStatus === 'SENDING' ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </form>

            {resendStatus && resendStatus !== 'SENDING' && (
              <p className="text-xs text-gray-500 mt-3">{resendStatus}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EmailVerificationPage;
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/authService';
import { tokenStorage } from '../api/axiosInstance';
import Button from '../components/ui/Button';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      // Clear any existing session to require a fresh login
      tokenStorage.clearTokens();

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          non_field_errors: [err.response?.data?.detail || t('password_reset_error', 'Something went wrong. Please try again.')],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-accent-200 selection:text-primary-900 transition-colors duration-300">
      
      {/* LEFT PANEL: HERO BRANDING & BACKGROUND (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 overflow-hidden flex-col p-12 justify-between">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-50 dark:brightness-75 scale-105 transition-transform duration-10000 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1920&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-900/60 to-primary-900/30" />

        {/* Brand Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/40 backdrop-blur-md flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              ias<span className="text-accent-400">.</span>
            </span>
          </Link>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 space-y-4 max-w-md">
          <span className="inline-block px-3 py-1 bg-white/10 border border-white/30 text-white rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            {t('security_update', 'Security Update')}
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            {t('create_new_password_title', 'Create a New Password for Your Account.')}
          </h2>
          <p className="text-sm text-primary-100 leading-relaxed">
            {t('create_new_password_subtitle', 'Choose a strong, memorable password to secure your personal dashboard, reports, and portal permissions.')}
          </p>
        </div>

        {/* Bottom Footer Status */}
        <div className="relative z-10 text-xs text-primary-200 flex items-center justify-between border-t border-primary-800/80 pt-6">
          <span>© {new Date().getFullYear()} {t('ias_platform', 'IAS Platform')}</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            {t('encryption_active', 'Encryption Active')}
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: RESET FORM / SUCCESS CONTAINER */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="w-full max-w-md space-y-8 bg-white/90 dark:bg-zinc-900/90 border border-slate-100 dark:border-zinc-800/80 p-8 sm:p-10 rounded-3xl shadow-soft dark:shadow-2xl backdrop-blur-xl">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-500/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
                </svg>
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                ias<span className="text-primary-500">.</span>
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-500/30 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {t('reset_password_title', 'Reset Password')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {t('reset_password_subtitle', 'Please set your new account password below.')}
            </p>
          </div>

          {/* SUCCESS STATE VIEW */}
          {success ? (
            <div className="space-y-6 animate-fadeIn text-center">
              <div className="p-6 bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-800/80 rounded-2xl space-y-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-200 dark:border-primary-500/30 animate-bounce">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('password_updated', 'Password Updated!')}</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {t('password_reset_success', 'Your password has been reset successfully. Redirecting you to the sign in page...')}
                  </p>
                </div>

                {/* Progress Bar Loader */}
                <div className="w-full bg-slate-200 dark:bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-slate-300 dark:border-zinc-800 mt-2">
                  <div className="bg-primary-500 h-full w-full animate-pulse" />
                </div>
              </div>

              <Link
                to="/login"
                className="inline-flex w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all items-center justify-center gap-2 text-sm active:scale-[0.98]"
              >
                <span>{t('click_if_not_redirected', 'Click if not redirected')}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* General Non-Field Errors */}
              {errors?.non_field_errors && (
                <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-xl text-red-600 dark:text-red-300 text-xs flex items-start gap-3 animate-fadeIn">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.non_field_errors.join(' ')}</span>
                </div>
              )}

              {/* Expired / Invalid Token Error Alert */}
              {errors?.token && (
                <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-xl text-red-600 dark:text-red-300 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errors.token[0]}</span>
                  </div>
                  <div className="pl-8">
                    <Link
                      to="/forgot-password"
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold underline underline-offset-4 text-xs transition-colors"
                    >
                      {t('request_new_reset_link', 'Request a new password reset link →')}
                    </Link>
                  </div>
                </div>
              )}

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                  {t('new_password', 'New Password')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-zinc-950/80 border ${
                      errors?.new_password ? 'border-red-500/80' : 'border-slate-200 dark:border-zinc-800'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors?.new_password && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium pl-1 mt-1">{errors.new_password.join(' ')}</p>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                  {t('confirm_new_password', 'Confirm New Password')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-zinc-950/80 border ${
                      errors?.confirm_new_password ? 'border-red-500/80' : 'border-slate-200 dark:border-zinc-800'
                    } rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors?.confirm_new_password && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium pl-1 mt-1">{errors.confirm_new_password.join(' ')}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                loadingText={t('updating_password', 'Updating Password...')}
                className="mt-6 shadow-primary-500/30 py-3 text-[15px]"
              >
                <div className="flex items-center gap-2">
                  <span>{t('confirm_reset_password', 'Confirm Reset Password')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Button>
            </form>
          )}

          {/* Navigation Footer */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {t('back_to_safe_territory', 'Back to safe territory?')} {' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors underline underline-offset-4"
              >
                {t('return_to_login', 'Return to Login')}
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default ResetPasswordPage;
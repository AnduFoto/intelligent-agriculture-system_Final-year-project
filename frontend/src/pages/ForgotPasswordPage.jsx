import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../api/authService';
import Button from '../components/ui/Button';

function ForgotPasswordPage() {
  const { t } = useTranslation();
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
      setMessage(response.data.detail || t('password_reset_sent', 'Password reset instructions have been sent to your email.'));
    } catch (err) {
      setError(err.response?.data?.detail || t('password_reset_error', 'Something went wrong. Please check your connection and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setMessage(null);
    setError('');
    setEmail('');
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-accent-200 selection:text-primary-900 transition-colors duration-300">
      
      {/* LEFT PANEL: HERO BRANDING & BACKGROUND (Hidden on small mobile screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 overflow-hidden flex-col p-12 justify-between">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-50 dark:brightness-75 scale-105 transition-transform duration-10000 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop')`,
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
            {t('account_recovery', 'Account Recovery')}
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            {t('secure_access_recovery', 'Secure Access Recovery for Your Portal.')}
          </h2>
          <p className="text-sm text-primary-100 leading-relaxed">
            {t('recovery_instructions', 'Don\'t worry—it happens. Provide your registered email address and we\'ll send you instructions to securely reset your credentials.')}
          </p>
        </div>

        {/* Bottom Status / Footer info */}
        <div className="relative z-10 text-xs text-primary-200 flex items-center justify-between border-t border-primary-800/80 pt-6">
          <span>© {new Date().getFullYear()} {t('ias_platform', 'IAS Platform')}</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            {t('system_normal', 'System Normal')}
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: FORGOT PASSWORD FORM CONTAINER */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {t('forgot_password_title', 'Forgot Password?')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {t('forgot_password_subtitle', 'Enter your email address and we\'ll send you a link to reset your password.')}
            </p>
          </div>

          {/* SUCCESS STATE CARD */}
          {message ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-800/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-500/30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('reset_link_dispatched', 'Reset Link Dispatched')}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed pl-11">
                  {message}
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>{t('return_to_signin', 'Return to Sign In')}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-semibold py-3 px-4 rounded-xl transition-colors text-xs"
                >
                  {t('try_again', 'Didn\'t receive an email? Try again')}
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Alert Box */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-xl text-red-600 dark:text-red-300 text-xs flex items-start gap-3 animate-fadeIn">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                  {t('registered_email', 'Registered Email Address')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                loadingText={t('sending_reset_link', 'Sending Reset Link...')}
                className="mt-6 shadow-primary-500/30 py-3 text-[15px]"
              >
                <div className="flex items-center gap-2">
                  <span>{t('send_reset_link', 'Send Reset Link')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Button>
            </form>
          )}

          {/* Navigation Back Footer */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {t('remembered_password', 'Remembered your password?')} {' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors underline underline-offset-4"
              >
                {t('log_in', 'Log in')}
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default ForgotPasswordPage;
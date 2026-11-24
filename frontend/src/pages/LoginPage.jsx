import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const DASHBOARD_BY_ROLE = {
  FARMER: '/farmer/dashboard',
  OFFICER: '/officer/dashboard',
  ADMINISTRATOR: '/admin/dashboard',
};

function LoginPage() {
  const { login, isAuthenticated, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect straight to appropriate dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      const redirectTo = location.state?.from?.pathname || DASHBOARD_BY_ROLE[role] || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, role, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const userData = await login(email, password);
      const redirectTo = location.state?.from?.pathname || DASHBOARD_BY_ROLE[userData.role] || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || t('login_failed', 'Invalid email or password. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-zinc-400 uppercase">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-accent-200 selection:text-primary-900 transition-colors duration-300">
      
      {/* LEFT PANEL: HERO BRANDING & BACKGROUND (Hidden on small mobile screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 overflow-hidden items-between flex-col p-12 justify-between">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-50 dark:brightness-75 scale-105 transition-transform duration-10000 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1920&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-900/60 to-primary-900/30" />

        {/* Brand Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/40 backdrop-blur-md flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
            </svg>
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            ias<span className="text-accent-400">.</span>
          </span>
        </div>

        {/* Middle Feature Tagline */}
        <div className="relative z-10 space-y-4 max-w-md">
          <span className="inline-block px-3 py-1 bg-white/10 border border-white/30 text-white rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            {t('platform_tag', 'Intelligent Agriculture System')}
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            {t('hero_title', 'Empowering Modern Farming with AI Intelligence.')}
          </h2>
          <p className="text-sm text-primary-100 leading-relaxed">
            {t('hero_subtitle', 'Access crop disease diagnostics, officer consultations, and region-wide agricultural insights through a unified ecosystem.')}
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

      {/* RIGHT PANEL: LOGIN FORM CONTAINER */}
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
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {t('welcome_back', 'Welcome Back')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {t('login_subtitle', 'Enter your credentials to access your portal account.')}
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-xl text-red-600 dark:text-red-300 text-xs flex items-start gap-3 animate-fadeIn">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                {t('email_address', 'Email Address')}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                  {t('password', 'Password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-semibold"
                >
                  {t('forgot_password', 'Forgot password?')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                {/* Password Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
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
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              loadingText={t('signing_in', 'Signing In...')}
              className="mt-6 shadow-primary-500/30 py-3 text-[15px]"
            >
              <div className="flex items-center gap-2">
                <span>{t('sign_in', 'Sign In to Account')}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Button>
          </form>

          {/* Registration Redirect Footer */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              {t('no_account', 'Don\'t have an account?')} {' '}
              <Link
                to="/register"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors underline underline-offset-4"
              >
                {t('create_account', 'Create an account')}
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;



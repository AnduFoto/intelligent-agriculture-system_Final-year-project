// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const DASHBOARD_BY_ROLE = {
//   FARMER: '/farmer/dashboard',
//   OFFICER: '/officer/dashboard',
//   ADMINISTRATOR: '/admin/dashboard',
// };

// function LoginPage() {
//   const { login, isAuthenticated, role, isLoading: authLoading } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // If already authenticated (e.g. revisiting /login with a live
//   // session), redirect straight to the appropriate dashboard rather
//   // than showing the form again.
//   useEffect(() => {
//     if (!authLoading && isAuthenticated && role) {
//       const redirectTo = location.state?.from?.pathname || DASHBOARD_BY_ROLE[role] || '/';
//       navigate(redirectTo, { replace: true });
//     }
//   }, [authLoading, isAuthenticated, role]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsSubmitting(true);

//     try {
//       const userData = await login(email, password);
//       const redirectTo = location.state?.from?.pathname || DASHBOARD_BY_ROLE[userData.role] || '/';
//       navigate(redirectTo, { replace: true });
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Login failed. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (authLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <p className="text-sm text-gray-400">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <div className="max-w-sm w-full bg-white rounded-lg shadow p-8">
//         <h1 className="text-2xl font-semibold text-primary-700 mb-1">Welcome Back</h1>
//         <p className="text-sm text-gray-500 mb-6">Log in to the Intelligent Agriculture System.</p>

//         {error && (
//           <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//           </div>

//           <div className="text-right">
//             <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">
//               Forgot password?
//             </Link>
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition"
//           >
//             {isSubmitting ? 'Logging in...' : 'Log In'}
//           </button>
//         </form>

//         <p className="text-sm text-gray-500 text-center mt-6">
//           Don't have an account?{' '}
//           <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;



import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DASHBOARD_BY_ROLE = {
  FARMER: '/farmer/dashboard',
  OFFICER: '/officer/dashboard',
  ADMINISTRATOR: '/admin/dashboard',
};

function LoginPage() {
  const { login, isAuthenticated, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* LEFT PANEL: HERO BRANDING & BACKGROUND (Hidden on small mobile screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden items-between flex-col p-12 justify-between">
        {/* Background Image with Dark Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-75 scale-105 transition-transform duration-10000 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1920&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />

        {/* Brand Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
            </svg>
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            ias<span className="text-emerald-500">.</span>
          </span>
        </div>

        {/* Middle Feature Tagline */}
        <div className="relative z-10 space-y-4 max-w-md">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
            Intelligent Agriculture System
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Empowering Modern Farming with AI Intelligence.
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Access crop disease diagnostics, officer consultations, and region-wide agricultural insights through a unified ecosystem.
          </p>
        </div>

        {/* Bottom Status / Footer info */}
        <div className="relative z-10 text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-6">
          <span>© {new Date().getFullYear()} IAS Platform</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Normal
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: LOGIN FORM CONTAINER */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 bg-zinc-900/90 border border-zinc-800/80 p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-xl">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                ias<span className="text-emerald-500">.</span>
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Enter your credentials to access your portal account.
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="p-4 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-3 animate-fadeIn">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <div className="absolute right-3.5 top-3.5 text-zinc-500 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                {/* Password Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 text-sm mt-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect Footer */}
          <div className="text-center pt-2 border-t border-zinc-800/60">
            <p className="text-xs sm:text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default LoginPage;



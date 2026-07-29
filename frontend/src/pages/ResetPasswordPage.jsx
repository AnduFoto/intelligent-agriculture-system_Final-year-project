// import { useState } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { authService } from '../api/authService';
// import { tokenStorage } from '../api/axiosInstance';

// function ResetPasswordPage() {
//   const { token } = useParams();
//   const navigate = useNavigate();

//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [errors, setErrors] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors(null);
//     setIsSubmitting(true);

//     try {
//       await authService.resetPassword({
//         token,
//         new_password: newPassword,
//         confirm_new_password: confirmNewPassword,
//       });

//       // Clear any existing session — a password reset should always
//       // require a fresh login, even if this browser happened to have
//       // an old, still-valid session active.
//       tokenStorage.clearTokens();

//       setSuccess(true);
//       setTimeout(() => {
//         window.location.href = '/login';
//       }, 2500);
//     } catch (err) {
//       if (err.response?.data?.errors) {
//         setErrors(err.response.data.errors);
//       } else {
//         setErrors({ non_field_errors: [err.response?.data?.detail || 'Something went wrong.'] });
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//         <div className="max-w-sm w-full bg-white rounded-lg shadow p-8 text-center">
//           <h2 className="text-xl font-semibold text-primary-700 mb-3">Password Reset</h2>
//           <p className="text-sm text-gray-600">
//             Your password has been reset successfully. Redirecting you to login...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
//       <div className="max-w-sm w-full bg-white rounded-lg shadow p-8">
//         <h1 className="text-2xl font-semibold text-primary-700 mb-1">Reset Password</h1>
//         <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>

//         {errors?.non_field_errors && (
//           <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
//             {errors.non_field_errors.join(' ')}
//           </div>
//         )}
//         {errors?.token && (
//           <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
//             {errors.token[0]}{' '}
//             <Link to="/forgot-password" className="underline font-medium">
//               Request a new link
//             </Link>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
//             <input
//               type="password"
//               required
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//             {errors?.new_password && (
//               <p className="text-xs text-red-600 mt-1">{errors.new_password.join(' ')}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
//             <input
//               type="password"
//               required
//               value={confirmNewPassword}
//               onChange={(e) => setConfirmNewPassword(e.target.value)}
//               className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
//             />
//             {errors?.confirm_new_password && (
//               <p className="text-xs text-red-600 mt-1">{errors.confirm_new_password.join(' ')}</p>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition"
//           >
//             {isSubmitting ? 'Resetting...' : 'Reset Password'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ResetPasswordPage;



import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import { tokenStorage } from '../api/axiosInstance';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

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
          non_field_errors: [err.response?.data?.detail || 'Something went wrong. Please try again.'],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* LEFT PANEL: HERO BRANDING & BACKGROUND (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden flex-col p-12 justify-between">
        {/* Background Image with Dark Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-75 scale-105 transition-transform duration-10000 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1920&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />

        {/* Brand Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              ias<span className="text-emerald-500">.</span>
            </span>
          </Link>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 space-y-4 max-w-md">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
            Security Update
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Create a New Password for Your Account.
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Choose a strong, memorable password to secure your personal dashboard, reports, and portal permissions.
          </p>
        </div>

        {/* Bottom Footer Status */}
        <div className="relative z-10 text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-6">
          <span>© {new Date().getFullYear()} IAS Platform</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Encryption Active
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: RESET FORM / SUCCESS CONTAINER */}
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

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Please set your new account password below.
            </p>
          </div>

          {/* SUCCESS STATE VIEW */}
          {success ? (
            <div className="space-y-6 animate-fadeIn text-center">
              <div className="p-6 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl space-y-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-bounce">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Password Updated!</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Your password has been reset successfully. Redirecting you to the sign in page...
                  </p>
                </div>

                {/* Progress Bar Loader */}
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800 mt-2">
                  <div className="bg-emerald-500 h-full w-full animate-pulse" />
                </div>
              </div>

              <Link
                to="/login"
                className="inline-flex w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/30 transition-all items-center justify-center gap-2 text-sm active:scale-[0.98]"
              >
                <span>Click if not redirected</span>
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
                <div className="p-4 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-3 animate-fadeIn">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.non_field_errors.join(' ')}</span>
                </div>
              )}

              {/* Expired / Invalid Token Error Alert */}
              {errors?.token && (
                <div className="p-4 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errors.token[0]}</span>
                  </div>
                  <div className="pl-8">
                    <Link
                      to="/forgot-password"
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4 text-xs transition-colors"
                    >
                      Request a new password reset link →
                    </Link>
                  </div>
                </div>
              )}

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full bg-zinc-950/80 border ${
                      errors?.new_password ? 'border-red-500/80' : 'border-zinc-800'
                    } rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
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
                  <p className="text-xs text-red-400 font-medium pl-1 mt-1">{errors.new_password.join(' ')}</p>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`w-full bg-zinc-950/80 border ${
                      errors?.confirm_new_password ? 'border-red-500/80' : 'border-zinc-800'
                    } rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
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
                  <p className="text-xs text-red-400 font-medium pl-1 mt-1">{errors.confirm_new_password.join(' ')}</p>
                )}
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
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Reset Password</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Navigation Footer */}
          <div className="text-center pt-2 border-t border-zinc-800/60">
            <p className="text-xs sm:text-sm text-zinc-400">
              Back to safe territory?{' '}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors underline underline-offset-4"
              >
                Return to Login
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default ResetPasswordPage;
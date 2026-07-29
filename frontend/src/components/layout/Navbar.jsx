// import { Link, useNavigate } from 'react-router-dom';
// import { useState } from 'react';
// import { useAuth } from '../../context/AuthContext';

// const NAV_LINKS_BY_ROLE = {
//   FARMER: [{ label: 'Dashboard', to: '/farmer/dashboard' }],
//   OFFICER: [{ label: 'Dashboard', to: '/officer/dashboard' }],
//   ADMINISTRATOR: [
//     { label: 'Dashboard', to: '/admin/dashboard' },
//     { label: 'Users', to: '/admin/users' },
//     { label: 'Locations', to: '/admin/locations' },
//   ],
// };

// function Navbar() {
//   const { user, role, logout } = useAuth();
//   const navigate = useNavigate();
//   const [menuOpen, setMenuOpen] = useState(false);

//   const links = NAV_LINKS_BY_ROLE[role] || [];

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login', { replace: true });
//   };

//   return (
//     <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
//       <div className="max-w-6xl mx-auto flex items-center justify-between">
//         <div className="flex items-center gap-8">
//           <span className="text-primary-700 font-semibold text-lg">IAS</span>

//           {/* Desktop links */}
//           <div className="hidden sm:flex items-center gap-5">
//             {links.map((link) => (
//               <Link key={link.to} to={link.to} className="text-sm text-gray-600 hover:text-primary-700 font-medium">
//                 {link.label}
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* Desktop right side */}
//         <div className="hidden sm:flex items-center gap-4">
//           <Link to="/profile" className="text-sm text-gray-600 hover:text-primary-700">
//             {user?.first_name} {user?.last_name}
//           </Link>
//           <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">
//             Log Out
//           </button>
//         </div>

//         {/* Mobile menu toggle */}
//         <button
//           className="sm:hidden text-gray-600"
//           onClick={() => setMenuOpen((o) => !o)}
//           aria-label="Toggle menu"
//         >
//           {menuOpen ? '✕' : '☰'}
//         </button>
//       </div>

//       {/* Mobile dropdown */}
//       {menuOpen && (
//         <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3">
//           {links.map((link) => (
//             <Link
//               key={link.to}
//               to={link.to}
//               onClick={() => setMenuOpen(false)}
//               className="text-sm text-gray-600 hover:text-primary-700 font-medium"
//             >
//               {link.label}
//             </Link>
//           ))}
//           <Link
//             to="/profile"
//             onClick={() => setMenuOpen(false)}
//             className="text-sm text-gray-600 hover:text-primary-700"
//           >
//             {user?.first_name} {user?.last_name}
//           </Link>
//           <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium text-left">
//             Log Out
//           </button>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;




import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS_BY_ROLE = {
  FARMER: [{ label: 'Dashboard', to: '/farmer/dashboard' }],
  OFFICER: [{ label: 'Dashboard', to: '/officer/dashboard' }],
  ADMINISTRATOR: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Locations', to: '/admin/locations' },
  ],
};

function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = NAV_LINKS_BY_ROLE[role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="w-full font-sans shadow-sm">
      {/* TOP UTILITY BAR (Dark Charcoal Header) */}
      <div className="bg-zinc-900 text-zinc-300 text-xs py-2 px-4 sm:px-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Top Left - Contact / System Info */}
          <div className="flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="hover:text-white transition-colors cursor-pointer">
              support@ias-pellets.org
            </span>
          </div>

          {/* Top Right - Social Icons & User Greeting */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-zinc-400">
              Logged in as: <strong className="text-white">{user?.first_name || 'User'}</strong>
            </span>
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-700">
              {/* Facebook Icon */}
              <a href="#" className="w-5 h-5 rounded-full bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white flex items-center justify-center transition-all text-[10px]">
                f
              </a>
              {/* Twitter/X Icon */}
              <a href="#" className="w-5 h-5 rounded-full bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white flex items-center justify-center transition-all text-[10px]">
                X
              </a>
              {/* Instagram Icon */}
              <a href="#" className="w-5 h-5 rounded-full bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white flex items-center justify-center transition-all text-[10px]">
                i
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <nav className="bg-white py-3.5 px-4 sm:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* BRAND LOGO SECTION */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <svg
                className="w-5 h-5 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none">
                ias<span className="text-emerald-600">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold -mt-0.5">
                Agriculture Systems
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS (CENTER) */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* DESKTOP RIGHT ACTION SECTION */}
          <div className="hidden sm:flex items-center gap-5">
            {/* Profile Link */}
            <Link
              to="/profile"
              className="text-sm font-semibold text-gray-700 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
            >
              <span>{user?.first_name} {user?.last_name}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Styled Primary Pill Callout Button (Logout action) */}
            <button
              onClick={handleLogout}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-2 flex items-center gap-3 shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/80 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-emerald-200 font-bold leading-tight">
                  ACCOUNT ACTION
                </span>
                <span className="text-xs font-bold leading-tight">
                  LOG OUT
                </span>
              </div>
            </button>
          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            className="lg:hidden p-2 text-gray-700 hover:text-emerald-600 rounded-lg focus:outline-none"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {menuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3 px-2 pb-2 bg-gray-50 rounded-xl">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-700 hover:text-emerald-600 font-semibold py-1.5 px-2 rounded-md hover:bg-white transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-700 hover:text-emerald-600 font-semibold py-1.5 px-2 rounded-md hover:bg-white transition-all"
            >
              Profile: {user?.first_name} {user?.last_name}
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 rounded-full transition-all mt-2"
            >
              Log Out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
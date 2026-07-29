// import { Outlet } from 'react-router-dom';
// import Navbar from './Navbar';

// function DashboardLayout() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <main className="max-w-6xl mx-auto px-6 py-8">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// export default DashboardLayout;
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Navigation items by role including all Farmer, Officer, and Admin dashboard cards
const NAV_LINKS_BY_ROLE = {
  FARMER: [
    {
      label: 'Dashboard',
      to: '/farmer/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'Disease Detection',
      to: '/farmer/predict',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
      label: 'Consultations',
      to: '/farmer/consultations',
      note: 'Soon',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    },
    {
      label: 'Farming Tips',
      to: '/farmer/tips',
      note: 'Soon',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      label: 'Community',
      to: '/farmer/community',
      note: 'Soon',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    },
  ],
  OFFICER: [
    {
      label: 'Dashboard',
      to: '/officer/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'Consultation Requests',
      to: '/officer/consultations',
      note: 'Soon',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    },
    {
      label: 'Publish Farming Tips',
      to: '/officer/tips',
      note: 'Soon',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    },
    {
      label: 'Educational Content',
      to: '/officer/education',
      note: 'Soon',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
    {
      label: 'Content Moderation',
      to: '/officer/moderation',
      note: 'Soon',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
  ],
  ADMINISTRATOR: [
    {
      label: 'Dashboard',
      to: '/admin/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'User Management',
      to: '/admin/users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      label: 'Location Management',
      to: '/admin/locations',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
    },
    {
      label: 'System Analytics',
      to: '/admin/analytics',
      note: 'Soon',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
  ],
};

function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = NAV_LINKS_BY_ROLE[role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Dynamic Workspace Header Title
  const getWorkspaceTitle = () => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'Administrator Portal';
      case 'OFFICER':
        return 'Officer Workspace';
      default:
        return 'Farmer Workspace';
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* MOBILE OVERLAY BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. FIXED FULL-HEIGHT SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-zinc-900 text-zinc-300 flex flex-col transition-transform duration-300 transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-zinc-800 shadow-xl
        `}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white leading-none">
                ias<span className="text-emerald-500">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mt-0.5">
                Agri Portal
              </span>
            </div>
          </Link>

          <button
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation Links (Includes all Farmer, Officer, & Admin Cards) */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Main Menu
          </div>

          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                  ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                  </svg>
                  <span className="truncate">{link.label}</span>
                </div>

                {/* Coming Soon Badge */}
                {link.note && (
                  <span className="text-[9px] font-bold uppercase bg-zinc-800 text-emerald-400 border border-emerald-900/50 px-1.5 py-0.5 rounded-md group-hover:border-emerald-500/50 transition-colors">
                    {link.note}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Account
          </div>

          {/* Profile Link in Sidebar */}
          <Link
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
              ${
                location.pathname === '/profile'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
              }
            `}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </Link>
        </nav>

        {/* Sidebar User Footer Badge */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60">
          <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
              {user?.first_name ? user.first_name[0] : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold truncate uppercase">
                {role || 'USER'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Pushed right by md:pl-64 to fit fixed sidebar) */}
      <div className="md:pl-64 flex flex-col min-h-screen w-full transition-all">
        
        {/* TOP UTILITY BAR (Dark Header) */}
        <header className="bg-zinc-900 text-zinc-300 text-xs py-2 px-4 sm:px-8 border-b border-zinc-800">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hover:text-white transition-colors cursor-pointer">support@ias-pellets.org</span> */}
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block text-zinc-400">
                System Status: <strong className="text-emerald-400 font-semibold">Online</strong>
              </span>
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-700">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px]">f</span>
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px]">X</span>
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px]">i</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN NAVIGATION BAR */}
        <nav className="bg-white py-3.5 px-4 sm:px-8 border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="w-full flex items-center justify-between">
            
            {/* Mobile Toggle & Workspace Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-emerald-600 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
                {getWorkspaceTitle()}
              </h2>
            </div>

            {/* Logout Action Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-5 py-2 flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <div className="w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-red-300 uppercase tracking-wider">Log Out</span>
              </button>
            </div>
          </div>
        </nav>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col">
          
          {/* Hero Banner Accent */}
          

          {/* Router Content Container (Fills 100% available width) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 flex-1 min-h-[500px] w-full">
            <Outlet />
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-zinc-900 text-zinc-400 text-xs py-4 px-4 sm:px-8 border-t border-zinc-800 mt-auto w-full">
          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold tracking-tight text-sm">
                ias<span className="text-emerald-500">.</span>
              </span>
              <span className="text-zinc-600">|</span>
              <span>© {new Date().getFullYear()} Integrated Agriculture Systems. All rights reserved.</span>
            </div>
            <div className="flex gap-4 text-zinc-400 font-medium">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default DashboardLayout;







// import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
// import { useState } from 'react';
// import { useAuth } from '../../context/AuthContext';

// // Navigation items by role including all Farmer, Officer, and Admin dashboard cards
// const NAV_LINKS_BY_ROLE = {
//   FARMER: [
//     {
//       label: 'Dashboard',
//       to: '/farmer/dashboard',
//       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
//     },
//     {
//       label: 'Disease Detection',
//       to: '/farmer/predict',
//       icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
//     },
//     {
//       label: 'Consultations',
//       to: '/farmer/consultations',
//       note: 'Soon',
//       icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
//     },
//     {
//       label: 'Farming Tips',
//       to: '/farmer/tips',
//       note: 'Soon',
//       icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
//     },
//     {
//       label: 'Community',
//       to: '/farmer/community',
//       note: 'Soon',
//       icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
//     },
//   ],
//   OFFICER: [
//     {
//       label: 'Dashboard',
//       to: '/officer/dashboard',
//       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
//     },
//     {
//       label: 'Consultation Requests',
//       to: '/officer/consultations',
//       note: 'Soon',
//       icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
//     },
//     {
//       label: 'Publish Farming Tips',
//       to: '/officer/tips',
//       note: 'Soon',
//       icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
//     },
//     {
//       label: 'Educational Content',
//       to: '/officer/education',
//       note: 'Soon',
//       icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
//     },
//     {
//       label: 'Content Moderation',
//       to: '/officer/moderation',
//       note: 'Soon',
//       icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
//     },
//   ],
//   ADMINISTRATOR: [
//     {
//       label: 'Dashboard',
//       to: '/admin/dashboard',
//       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
//     },
//     {
//       label: 'User Management',
//       to: '/admin/users',
//       icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
//     },
//     {
//       label: 'Location Management',
//       to: '/admin/locations',
//       icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
//     },
//     {
//       label: 'System Analytics',
//       to: '/admin/analytics',
//       note: 'Soon',
//       icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
//     },
//   ],
// };

// function DashboardLayout() {
//   const { user, role, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const links = NAV_LINKS_BY_ROLE[role] || [];

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login', { replace: true });
//   };

//   // Dynamic Workspace Header Title
//   const getWorkspaceTitle = () => {
//     switch (role) {
//       case 'ADMINISTRATOR':
//         return 'Administrator Portal';
//       case 'OFFICER':
//         return 'Officer Workspace';
//       default:
//         return 'Farmer Workspace';
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-zinc-950 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      
//       {/* MOBILE OVERLAY BACKDROP */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-zinc-950/80 z-40 md:hidden backdrop-blur-md transition-opacity duration-300"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* 1. FIXED FULL-HEIGHT SIDEBAR */}
//       <aside
//         className={`
//           fixed top-0 left-0 bottom-0 z-50 w-64 bg-zinc-900 text-zinc-300 flex flex-col 
//           transition-transform duration-300 ease-in-out transform
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-zinc-800/80 shadow-2xl
//         `}
//       >
//         {/* Sidebar Brand Header */}
//         <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60 backdrop-blur-md">
//           <Link to="/" className="flex items-center gap-2.5 group">
//             <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-105">
//               <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
//               </svg>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-xl font-black tracking-tight text-white leading-none">
//                 ias<span className="text-emerald-500">.</span>
//               </span>
//               <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mt-0.5">
//                 Agri Portal
//               </span>
//             </div>
//           </Link>

//           <button
//             className="md:hidden text-zinc-400 hover:text-white transition-colors p-1"
//             onClick={() => setSidebarOpen(false)}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Navigation Links */}
//         <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
//           <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
//             Main Menu
//           </div>

//           {links.map((link) => {
//             const isActive = location.pathname === link.to;
//             return (
//               <Link
//                 key={link.to}
//                 to={link.to}
//                 onClick={() => setSidebarOpen(false)}
//                 className={`
//                   flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
//                   ${
//                     isActive
//                       ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
//                       : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
//                   }
//                 `}
//               >
//                 <div className="flex items-center gap-3 min-w-0">
//                   <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
//                   </svg>
//                   <span className="truncate">{link.label}</span>
//                 </div>

//                 {/* Coming Soon Badge */}
//                 {link.note && (
//                   <span className="text-[9px] font-bold uppercase bg-zinc-950 text-emerald-400 border border-emerald-900/50 px-1.5 py-0.5 rounded-md group-hover:border-emerald-500/50 transition-colors">
//                     {link.note}
//                   </span>
//                 )}
//               </Link>
//             );
//           })}

//           <div className="pt-4 px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
//             Account
//           </div>

//           {/* Profile Link in Sidebar */}
//           <Link
//             to="/profile"
//             onClick={() => setSidebarOpen(false)}
//             className={`
//               flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
//               ${
//                 location.pathname === '/profile'
//                   ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
//                   : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
//               }
//             `}
//           >
//             <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//             </svg>
//             <span>Profile</span>
//           </Link>
//         </nav>

//         {/* Sidebar User Footer Badge */}
//         <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
//           <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
//             <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center text-xs border border-emerald-500/30 shrink-0">
//               {user?.first_name ? user.first_name[0] : 'U'}
//             </div>
//             <div className="flex flex-col min-w-0">
//               <span className="text-xs font-bold text-white truncate">
//                 {user?.first_name} {user?.last_name}
//               </span>
//               <span className="text-[10px] text-emerald-400 font-semibold truncate uppercase">
//                 {role || 'USER'}
//               </span>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* 2. MAIN CONTENT AREA (Seamless, Edge-to-Edge, Smooth) */}
//       <div className="md:pl-64 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out p-0 m-0 border-0">
        
//         {/* TOP UTILITY BAR */}
//         <header className="bg-zinc-900 text-zinc-400 text-xs py-2 px-4 sm:px-8 border-b border-zinc-800/80 backdrop-blur-lg">
//           <div className="w-full flex justify-between items-center">
//             <div className="flex items-center gap-2"></div>
//             <div className="flex items-center gap-4">
//               <span className="hidden sm:inline-block text-zinc-400">
//                 System Status: <strong className="text-emerald-400 font-semibold">Online</strong>
//               </span>
//               <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
//                 <span className="w-5 h-5 rounded-full bg-zinc-800/80 text-zinc-400 flex items-center justify-center text-[10px] font-bold">f</span>
//                 <span className="w-5 h-5 rounded-full bg-zinc-800/80 text-zinc-400 flex items-center justify-center text-[10px] font-bold">X</span>
//                 <span className="w-5 h-5 rounded-full bg-zinc-800/80 text-zinc-400 flex items-center justify-center text-[10px] font-bold">i</span>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* MAIN NAVIGATION BAR */}
//         <nav className="bg-zinc-900/90 py-3.5 px-4 sm:px-8 border-b border-zinc-800/80 sticky top-0 z-30 shadow-lg backdrop-blur-xl transition-all">
//           <div className="w-full flex items-center justify-between">
            
//             {/* Mobile Toggle & Workspace Title */}
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="md:hidden p-2 text-zinc-400 hover:text-emerald-400 focus:outline-none transition-colors"
//                 aria-label="Toggle navigation menu"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               </button>

//               <h2 className="text-lg font-black text-white tracking-tight">
//                 {getWorkspaceTitle()}
//               </h2>
//             </div>

//             {/* Logout Action Button */}
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={handleLogout}
//                 className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
//               >
//                 <div className="w-4 h-4 rounded-full bg-rose-500/80 flex items-center justify-center shrink-0">
//                   <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7" />
//                   </svg>
//                 </div>
//                 <span className="text-xs font-extrabold uppercase tracking-wider">Log Out</span>
//               </button>
//             </div>
//           </div>
//         </nav>

//         {/* WORKSPACE CONTENT AREA (ZERO MARGIN, ZERO PADDING, ZERO BORDER) */}
//         <main className="flex-1 w-full p-0 m-0 border-0 flex flex-col transition-all duration-300 ease-in-out">
//           <div className="w-full flex-1 p-0 m-0 border-0 bg-transparent">
//             <Outlet />
//           </div>
//         </main>

//         {/* FOOTER */}
//         <footer className="bg-zinc-950 text-zinc-500 text-xs py-5 px-4 sm:px-8 border-t border-zinc-800/80 mt-auto w-full">
//           <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3">
//             <div className="flex items-center gap-2">
//               <span className="text-white font-black tracking-tight text-sm">
//                 ias<span className="text-emerald-500">.</span>
//               </span>
//               <span className="text-zinc-700">|</span>
//               <span>© {new Date().getFullYear()} Integrated Agriculture Systems. All rights reserved.</span>
//             </div>
//             <div className="flex gap-4 text-zinc-400 font-medium">
//               <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
//               <a href="#" className="hover:text-emerald-400 transition-colors">Terms</a>
//               <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
//             </div>
//           </div>
//         </footer>

//       </div>
//     </div>
//   );
// }

// export default DashboardLayout;
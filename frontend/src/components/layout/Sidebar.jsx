// import React, { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { useAuth } from '../../context/AuthContext';
// import axiosInstance from '../../api/axiosInstance';

// // Navigation items by role including all Farmer, Officer, and Admin dashboard cards
// const NAV_LINKS_BY_ROLE = {
//   FARMER: [
//     { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
//     { label: 'dashboard', to: '/farmer/dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//     { label: 'disease_detection', to: '/farmer/predict', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
//     { label: 'consultations', to: '/farmer/consultations', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//     { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//     { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
//     { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//     { label: 'reports_analytics', to: '/farmer/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//   ],
//   OFFICER: [
//     { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
//     { label: 'dashboard', to: '/officer/dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//     { label: 'disease_detection', to: '/officer/predict', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
//     { label: 'my_kebeles', to: '/officer/my-kebeles', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
//     { label: 'consultation_requests', to: '/officer/consultations', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
//     { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//     { label: 'browse_predictions', to: '/officer/browse/kebeles', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//     { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//     { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
//     { label: 'reports_analytics', to: '/officer/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    
//     // Lead Officer & Education Manager links
//     { label: 'kebele_consultations', to: '/officer/kebele-consultations', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z', isLeadOnly: true },
//     { label: 'specialization_mgmt', to: '/officer/specializations', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', isLeadOnly: true },
//     { label: 'create_new_resource', to: '/education/manage/new', icon: 'M12 4v16m8-8H4', isEduManagerOnly: true },
//     { label: 'manage_knowledge_base', to: '/education/manage', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', isEduManagerOnly: true },
//     { label: 'assign_kebele_managers', to: '/officer/kebele-managers', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', isLeadOnly: true },
//     { label: 'lead_reports_analytics', to: '/officer/lead-reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', isLeadOnly: true },
//   ],
//   ADMINISTRATOR: [
//     { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
//     { label: 'dashboard', to: '/admin/dashboard', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//     { label: 'user_management', to: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
//     { label: 'location_management', to: '/admin/locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
//     { label: 'officer_assignments', to: '/admin/officers', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
//     { label: 'lead_officers', to: '/admin/lead-officers', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
//     { label: 'crop_catalog', to: '/admin/crop-types', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
//     { label: 'crop_mapping', to: '/admin/crop-mapping', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
//     { label: 'disease_detection', to: '/admin/predict', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
//     { label: 'browse_predictions', to: '/admin/browse/kebeles', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//     { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//     { label: 'community_moderation', to: '/admin/community-reports', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' },
//     { label: 'chat_moderation', to: '/dashboard/admin/chat-reports', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' },
//     { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//     { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
//     { label: 'manage_knowledge_base', to: '/education/manage', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
//     { label: 'assign_woreda_managers', to: '/admin/woreda-managers', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
//     { label: 'education_management', to: '/admin/education', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//     { label: 'consultation_oversight', to: '/admin/consultations', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
//     { label: 'activity_audit_logs', to: '/admin/activity', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
//     { label: 'reports_analytics', to: '/admin/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//   ],
// };

// export default function Sidebar({ isOpen, setSidebarOpen }) {
//   const { role, user } = useAuth();
//   const location = useLocation();
//   const { t } = useTranslation();
//   const [isLeadOfficer, setIsLeadOfficer] = useState(false);
//   const [isEduManager, setIsEduManager] = useState(false);
  
//   useEffect(() => {
//     if (role === 'OFFICER') {
//       // Check if they are a Lead Officer to unhide certain menus
//       axiosInstance.get('/auth/my-lead-kebele/')
//         .then(res => {
//           if (res.data?.lead_officer || res.data?.id || res.data?.kebele_id) {
//             setIsLeadOfficer(true);
//           }
//         })
//         .catch(err => console.error('Failed to verify lead officer status', err));

//       // Check if they are designated as Educational Manager (Kebele or Woreda)
//       axiosInstance.get('/education/my-manager-status/')
//         .then(res => {
//           if (res.data?.is_educational_manager) {
//             setIsEduManager(true);
//           }
//         })
//         .catch(err => console.error('Failed to verify edu manager status', err));
//     }
//   }, [role]);

//   // Filter links: if the link is lead-only, only show if isLeadOfficer is true.
//   const allLinks = NAV_LINKS_BY_ROLE[role] || [];
//   const links = allLinks.filter(link => {
//     if (link.isLeadOnly && !isLeadOfficer) {
//       return false;
//     }
//     if (link.isEduManagerOnly && !isLeadOfficer && !isEduManager && !user?.is_educational_manager && role !== 'ADMINISTRATOR') {
//       return false;
//     }
//     return true;
//   });

//   return (
//     <>
//       {/* Mobile Backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-zinc-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
      
//       {/* Sidebar Container */}
//       <aside
//         className={`
//           fixed top-0 left-0 bottom-0 z-50 w-64 bg-zinc-950 text-zinc-300 flex flex-col transition-transform duration-300 transform
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 border-r border-zinc-800 shadow-xl
//         `}
//       >
//         {/* Brand Header */}
//         <div className="p-5 border-b border-zinc-900 flex items-center justify-between">
//           <Link to="/" className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
//               <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
//               </svg>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-xl font-bold tracking-tight text-white leading-none">
//                 {t('app_name_short', 'ias.')}
//               </span>
//               <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold mt-1">
//                 Agri Portal
//               </span>
//             </div>
//           </Link>
          
//           <button 
//             className="md:hidden text-zinc-500 hover:text-white transition-colors"
//             onClick={() => setSidebarOpen(false)}
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Navigation Links */}
//         <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
//           <div className="px-2 pb-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
//             {t('main_menu', 'Main Menu')}
//           </div>

//           {links.map((link) => {
//             const isActive = location.pathname.startsWith(link.to);
//             return (
//               <Link
//                 key={link.to}
//                 to={link.to}
//                 onClick={(e) => {
//                   if (link.isComingSoon) {
//                     e.preventDefault();
//                   } else {
//                     setSidebarOpen(false);
//                   }
//                 }}
//                 className={`
//                   flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-300 group
//                   ${isActive
//                       ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
//                       : link.isComingSoon
//                         ? 'text-zinc-600 cursor-not-allowed border border-transparent'
//                         : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50'
//                   }
//                 `}
//               >
//                 <div className="flex items-center gap-3.5">
//                   <svg className={`w-[22px] h-[22px] shrink-0 transition-all duration-300 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-zinc-500 group-hover:text-zinc-300 group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
//                   </svg>
//                   <span className="truncate capitalize tracking-wide">{t(link.label, link.label.replace(/_/g, ' '))}</span>
//                 </div>
//                 {link.isComingSoon && (
//                   <span className="text-[10px] uppercase tracking-widest font-bold bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded-md shadow-sm">
//                     {t('coming_soon', 'Soon')}
//                   </span>
//                 )}
//               </Link>
//             );
//           })}
//         </nav>
//       </aside>
//     </>
//   );
// }


// import React, { useState, useEffect, useMemo } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { useAuth } from '../../context/AuthContext';
// import axiosInstance from '../../api/axiosInstance';

// // Grouped navigation structure with purpose-built icons
// const NAV_GROUPS_BY_ROLE = {
//   FARMER: [
//     {
//       groupKey: 'overview',
//       label: 'Overview',
//       items: [
//         { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
//         { label: 'dashboard', to: '/farmer/dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-5a1 1 0 011-1h4a1 1 0 011 1v9a1 1 0 01-1 1h-4a1 1 0 01-1-1v-9z' },
//       ],
//     },
//     {
//       groupKey: 'field_care',
//       label: 'Field & Care',
//       items: [
//         { label: 'disease_detection', to: '/farmer/predict', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
//         { label: 'consultations', to: '/farmer/consultations', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
//         { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//       ],
//     },
//     {
//       groupKey: 'knowledge_insights',
//       label: 'Learning & Reports',
//       items: [
//         { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//         { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
//         { label: 'reports_analytics', to: '/farmer/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//       ],
//     },
//   ],

//   OFFICER: [
//     {
//       groupKey: 'overview',
//       label: 'Overview',
//       items: [
//         { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
//         { label: 'dashboard', to: '/officer/dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-5a1 1 0 011-1h4a1 1 0 011 1v9a1 1 0 01-1 1h-4a1 1 0 01-1-1v-9z' },
//       ],
//     },
//     {
//       groupKey: 'field_operations',
//       label: 'Field Operations',
//       items: [
//         { label: 'disease_detection', to: '/officer/predict', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
//         { label: 'browse_predictions', to: '/officer/browse/kebeles', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
//         { label: 'my_kebeles', to: '/officer/my-kebeles', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
//         { label: 'consultation_requests', to: '/officer/consultations', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
//         { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//         { label: 'reports_analytics', to: '/officer/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//       ],
//     },
//     {
//       groupKey: 'knowledge_resources',
//       label: 'Knowledge & Edu',
//       items: [
//         { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//         { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
//         { label: 'create_new_resource', to: '/education/manage/new', icon: 'M12 4v16m8-8H4', isEduManagerOnly: true },
//         { label: 'manage_knowledge_base', to: '/education/manage', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', isEduManagerOnly: true },
//       ],
//     },
//     {
//       groupKey: 'lead_management',
//       label: 'Lead Administration',
//       items: [
//         { label: 'kebele_consultations', to: '/officer/kebele-consultations', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z', isLeadOnly: true },
//         { label: 'specialization_mgmt', to: '/officer/specializations', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', isLeadOnly: true },
//         { label: 'assign_kebele_managers', to: '/officer/kebele-managers', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', isLeadOnly: true },
//         { label: 'lead_reports_analytics', to: '/officer/lead-reports', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', isLeadOnly: true },
//       ],
//     },
//   ],

//   ADMINISTRATOR: [
//     {
//       groupKey: 'overview',
//       label: 'Overview',
//       items: [
//         { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
//         { label: 'dashboard', to: '/admin/dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-5a1 1 0 011-1h4a1 1 0 011 1v9a1 1 0 01-1 1h-4a1 1 0 01-1-1v-9z' },
//       ],
//     },
//     {
//       groupKey: 'organization',
//       label: 'Personnel & Areas',
//       items: [
//         { label: 'user_management', to: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
//         { label: 'officer_assignments', to: '/admin/officers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
//         { label: 'lead_officers', to: '/admin/lead-officers', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
//         { label: 'location_management', to: '/admin/locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
//         { label: 'assign_woreda_managers', to: '/admin/woreda-managers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
//       ],
//     },
//     {
//       groupKey: 'agriculture_ops',
//       label: 'Agricultural Setup',
//       items: [
//         { label: 'crop_catalog', to: '/admin/crop-types', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
//         { label: 'crop_mapping', to: '/admin/crop-mapping', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
//         { label: 'disease_detection', to: '/admin/predict', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
//         { label: 'browse_predictions', to: '/admin/browse/kebeles', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
//       ],
//     },
//     {
//       groupKey: 'communications_moderation',
//       label: 'Engagement & Moderation',
//       items: [
//         { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//         { label: 'community_moderation', to: '/admin/community-reports', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
//         { label: 'chat_moderation', to: '/dashboard/admin/chat-reports', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
//         { label: 'consultation_oversight', to: '/admin/consultations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
//       ],
//     },
//     {
//       groupKey: 'knowledge_system',
//       label: 'Content & System Logs',
//       items: [
//         { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
//         { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
//         { label: 'manage_knowledge_base', to: '/education/manage', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
//         { label: 'education_management', to: '/admin/education', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
//         { label: 'activity_audit_logs', to: '/admin/activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
//         { label: 'reports_analytics', to: '/admin/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
//       ],
//     },
//   ],
// };

// export default function Sidebar({ isOpen, setSidebarOpen }) {
//   const { role, user } = useAuth();
//   const location = useLocation();
//   const { t } = useTranslation();
//   const [isLeadOfficer, setIsLeadOfficer] = useState(false);
//   const [isEduManager, setIsEduManager] = useState(false);

//   useEffect(() => {
//     if (role === 'OFFICER') {
//       axiosInstance.get('/auth/my-lead-kebele/')
//         .then(res => {
//           if (res.data?.lead_officer || res.data?.id || res.data?.kebele_id) {
//             setIsLeadOfficer(true);
//           }
//         })
//         .catch(err => console.error('Failed to verify lead officer status', err));

//       axiosInstance.get('/education/my-manager-status/')
//         .then(res => {
//           if (res.data?.is_educational_manager) {
//             setIsEduManager(true);
//           }
//         })
//         .catch(err => console.error('Failed to verify edu manager status', err));
//     }
//   }, [role]);

//   // Filter links while maintaining categorical groups
//   const visibleGroups = useMemo(() => {
//     const rawGroups = NAV_GROUPS_BY_ROLE[role] || [];
//     return rawGroups
//       .map(group => ({
//         ...group,
//         items: group.items.filter(link => {
//           if (link.isLeadOnly && !isLeadOfficer) return false;
//           if (
//             link.isEduManagerOnly &&
//             !isLeadOfficer &&
//             !isEduManager &&
//             !user?.is_educational_manager &&
//             role !== 'ADMINISTRATOR'
//           ) {
//             return false;
//           }
//           return true;
//         }),
//       }))
//       .filter(group => group.items.length > 0);
//   }, [role, isLeadOfficer, isEduManager, user]);

//   return (
//     <>
//       {/* Mobile Backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar Container */}
//       <aside
//         className={`
//           fixed top-0 left-0 bottom-0 z-50 w-72 bg-zinc-950/95 backdrop-blur-xl text-zinc-300 flex flex-col 
//           transition-all duration-300 ease-in-out
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
//           border-r border-zinc-800/80 shadow-2xl
//         `}
//       >
//         {/* Brand Header */}
//         <div className="h-20 px-6 border-b border-zinc-800/60 flex items-center justify-between shrink-0">
//           <Link to="/" className="flex items-center gap-3.5 group">
//             <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-950/40">
//               <div className="w-full h-full bg-zinc-950 rounded-[15px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
//                 <svg className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M17 8C8 10 59 16.17 3.82 21.34L5.71 22 12 18.5V11C12 9.34 13.34 8 15 8H17ZM17 3C12.5 3 8.32 5.07 5.56 8.5C9.75 8.9 14.16 10.3 17.5 12.5C19.7 10.2 21 7.2 21 4V3H17Z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
//                 {t('app_name_short', 'ias')}
//                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
//               </span>
//               <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
//                 Agri Portal
//               </span>
//             </div>
//           </Link>

//           <button
//             className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 md:hidden transition-colors"
//             onClick={() => setSidebarOpen(false)}
//             aria-label="Close sidebar"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Scrollable Navigation */}
//         <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
//           {visibleGroups.map((group) => (
//             <div key={group.groupKey} className="space-y-1">
//               <div className="px-3 pb-2 text-[10px] font-bold tracking-widest uppercase text-zinc-500/80">
//                 {t(`nav_group_${group.groupKey}`, group.label)}
//               </div>

//               {group.items.map((link) => {
//                 const isActive = link.exact
//                   ? location.pathname === link.to
//                   : location.pathname.startsWith(link.to);

//                 return (
//                   <Link
//                     key={link.to}
//                     to={link.to}
//                     onClick={(e) => {
//                       if (link.isComingSoon) {
//                         e.preventDefault();
//                       } else {
//                         setSidebarOpen(false);
//                       }
//                     }}
//                     className={`
//                       relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
//                       ${isActive
//                         ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
//                         : link.isComingSoon
//                           ? 'text-zinc-600 cursor-not-allowed'
//                           : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
//                       }
//                     `}
//                   >
//                     {/* Active Accent Pillar */}
//                     {isActive && (
//                       <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
//                     )}

//                     <div className="flex items-center gap-3 min-w-0">
//                       <svg
//                         className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
//                           isActive
//                             ? 'text-emerald-400'
//                             : 'text-zinc-400 group-hover:text-zinc-200 group-hover:scale-105'
//                         }`}
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={link.icon} />
//                       </svg>
//                       <span className="truncate">{t(link.label, link.label.replace(/_/g, ' '))}</span>
//                     </div>

//                     {link.isComingSoon && (
//                       <span className="text-[9px] uppercase tracking-wider font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
//                         {t('coming_soon', 'Soon')}
//                       </span>
//                     )}
//                   </Link>
//                 );
//               })}
//             </div>
//           ))}
//         </nav>

//         {/* Footer Card */}
//         {user && (
//           <div className="p-3 border-t border-zinc-900">
//             <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
//               <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
//                 {user?.username ? user.username.charAt(0) : 'U'}
//               </div>
//               <div className="flex flex-col min-w-0">
//                 <span className="text-xs font-semibold text-zinc-200 truncate leading-snug">
//                   {user?.username || 'User'}
//                 </span>
//                 <span className="text-[10px] text-zinc-400 truncate">
//                   {role?.toLowerCase()}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}
//       </aside>
//     </>
//   );
// }





import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

// Grouped navigation structure with purpose-built icons
const NAV_GROUPS_BY_ROLE = {
  FARMER: [
    {
      groupKey: 'overview',
      label: 'Overview',
      items: [
        { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
        { label: 'dashboard', to: '/farmer/dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-5a1 1 0 011-1h4a1 1 0 011 1v9a1 1 0 01-1 1h-4a1 1 0 01-1-1v-9z' },
      ],
    },
    {
      groupKey: 'field_care',
      label: 'Field & Care',
      items: [
        { label: 'disease_detection', to: '/farmer/predict', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { label: 'consultations', to: '/farmer/consultations', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
        { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
      ],
    },
    {
      groupKey: 'knowledge_insights',
      label: 'Learning & Reports',
      items: [
        { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
        { label: 'reports_analytics', to: '/farmer/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      ],
    },
  ],

  OFFICER: [
    {
      groupKey: 'overview',
      label: 'Overview',
      items: [
        { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
        { label: 'dashboard', to: '/officer/dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-5a1 1 0 011-1h4a1 1 0 011 1v9a1 1 0 01-1 1h-4a1 1 0 01-1-1v-9z' },
      ],
    },
    {
      groupKey: 'field_operations',
      label: 'Field Operations',
      items: [
        { label: 'disease_detection', to: '/officer/predict', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
        { label: 'browse_predictions', to: '/officer/browse/kebeles', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
        { label: 'my_kebeles', to: '/officer/my-kebeles', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'consultation_requests', to: '/officer/consultations', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
        { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        { label: 'reports_analytics', to: '/officer/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      ],
    },
    {
      groupKey: 'knowledge_resources',
      label: 'Knowledge & Edu',
      items: [
        { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
        { label: 'create_new_resource', to: '/education/manage/new', icon: 'M12 4v16m8-8H4', isEduManagerOnly: true },
        { label: 'manage_knowledge_base', to: '/education/manage', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', isEduManagerOnly: true },
      ],
    },
    {
      groupKey: 'lead_management',
      label: 'Lead Administration',
      items: [
        { label: 'kebele_consultations', to: '/officer/kebele-consultations', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z', isLeadOnly: true },
        { label: 'specialization_mgmt', to: '/officer/specializations', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', isLeadOnly: true },
        { label: 'assign_kebele_managers', to: '/officer/kebele-managers', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', isLeadOnly: true },
        { label: 'lead_reports_analytics', to: '/officer/lead-reports', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', isLeadOnly: true },
      ],
    },
  ],

  ADMINISTRATOR: [
    {
      groupKey: 'overview',
      label: 'Overview',
      items: [
        { label: 'home_community', to: '/home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
        { label: 'dashboard', to: '/admin/dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-5a1 1 0 011-1h4a1 1 0 011 1v9a1 1 0 01-1 1h-4a1 1 0 01-1-1v-9z' },
      ],
    },
    {
      groupKey: 'organization',
      label: 'Personnel & Areas',
      items: [
        { label: 'user_management', to: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { label: 'officer_assignments', to: '/admin/officers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { label: 'lead_officers', to: '/admin/lead-officers', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        { label: 'location_management', to: '/admin/locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
        { label: 'assign_woreda_managers', to: '/admin/woreda-managers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      ],
    },
    {
      groupKey: 'agriculture_ops',
      label: 'Agricultural Setup',
      items: [
        { label: 'crop_catalog', to: '/admin/crop-types', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { label: 'crop_mapping', to: '/admin/crop-mapping', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
        { label: 'disease_detection', to: '/admin/predict', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
        { label: 'browse_predictions', to: '/admin/browse/kebeles', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      ],
    },
    {
      groupKey: 'communications_moderation',
      label: 'Engagement & Moderation',
      items: [
        { label: 'chat', to: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        { label: 'community_moderation', to: '/admin/community-reports', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
        { label: 'chat_moderation', to: '/dashboard/admin/chat-reports', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        // { label: 'consultation_oversight', to: '/admin/consultations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
      ],
    },
    {
      groupKey: 'knowledge_system',
      label: 'Content & System Logs',
      items: [
        { label: 'knowledge_base', to: '/education/library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { label: 'saved_content', to: '/education/saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
        { label: 'manage_knowledge_base', to: '/education/manage', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { label: 'education_management', to: '/admin/education', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { label: 'activity_audit_logs', to: '/admin/activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { label: 'reports_analytics', to: '/admin/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      ],
    },
  ],
};

export default function Sidebar({ isOpen, setSidebarOpen }) {
  const { role, user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [isLeadOfficer, setIsLeadOfficer] = useState(false);
  const [isEduManager, setIsEduManager] = useState(false);

  useEffect(() => {
    if (role === 'OFFICER') {
      axiosInstance.get('/auth/my-lead-kebele/')
        .then(res => {
          if (res.data?.lead_officer || res.data?.id || res.data?.kebele_id) {
            setIsLeadOfficer(true);
          }
        })
        .catch(err => console.error('Failed to verify lead officer status', err));

      axiosInstance.get('/education/my-manager-status/')
        .then(res => {
          if (res.data?.is_educational_manager) {
            setIsEduManager(true);
          }
        })
        .catch(err => console.error('Failed to verify edu manager status', err));
    }
  }, [role]);

  // Filter links while maintaining categorical groups
  const visibleGroups = useMemo(() => {
    const rawGroups = NAV_GROUPS_BY_ROLE[role] || [];
    return rawGroups
      .map(group => ({
        ...group,
        items: group.items.filter(link => {
          if (link.isLeadOnly && !isLeadOfficer) return false;
          if (
            link.isEduManagerOnly &&
            !isLeadOfficer &&
            !isEduManager &&
            !user?.is_educational_manager &&
            role !== 'ADMINISTRATOR'
          ) {
            return false;
          }
          return true;
        }),
      }))
      .filter(group => group.items.length > 0);
  }, [role, isLeadOfficer, isEduManager, user]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-72 bg-zinc-950/95 backdrop-blur-xl text-zinc-300 flex flex-col 
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
          border-r border-zinc-800/80 shadow-2xl
        `}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 border-b border-zinc-800/60 flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Massaye Logo Container with Ambient Glow */}
            <div className="relative w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800/80 p-1.5 flex items-center justify-center shadow-lg shadow-emerald-950/20 group-hover:border-emerald-500/40 transition-colors duration-300">
              <img 
                src="/Massaye logo.png" 
                alt="Massaye Logo" 
                className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                onError={(e) => {
                  // Fallback in case of SVG or alternative extension
                  if (!e.target.src.endsWith('.svg')) {
                    e.target.src = '/Massaye logo.svg';
                  }
                }}
              />
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                Massaye
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Agri Portal
              </span>
            </div>
          </Link>

          <button
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 md:hidden transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {visibleGroups.map((group) => (
            <div key={group.groupKey} className="space-y-1">
              <div className="px-3 pb-2 text-[10px] font-bold tracking-widest uppercase text-zinc-500/80">
                {t(`nav_group_${group.groupKey}`, group.label)}
              </div>

              {group.items.map((link) => {
                const isActive = link.exact
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={(e) => {
                      if (link.isComingSoon) {
                        e.preventDefault();
                      } else {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`
                      relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                        : link.isComingSoon
                          ? 'text-zinc-600 cursor-not-allowed'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                      }
                    `}
                  >
                    {/* Active Accent Pillar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                    )}

                    <div className="flex items-center gap-3 min-w-0">
                      <svg
                        className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? 'text-emerald-400'
                            : 'text-zinc-400 group-hover:text-zinc-200 group-hover:scale-105'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={link.icon} />
                      </svg>
                      <span className="truncate">{t(link.label, link.label.replace(/_/g, ' '))}</span>
                    </div>

                    {link.isComingSoon && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                        {t('coming_soon', 'Soon')}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Card */}
        {user && (
          <div className="p-3 border-t border-zinc-900">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                {user?.username ? user.username.charAt(0) : 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-zinc-200 truncate leading-snug">
                  {user?.username || 'User'}
                </span>
                <span className="text-[10px] text-zinc-400 truncate">
                  {role?.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
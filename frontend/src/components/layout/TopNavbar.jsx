import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { ChatButton } from '../chat/ChatButton';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

export default function TopNavbar({ setSidebarOpen }) {
  const { role, logout } = useAuth();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const getWorkspaceTitle = () => {
    switch (role) {
      case 'ADMINISTRATOR': return t('admin_portal', 'Administrator Portal');
      case 'OFFICER': return t('officer_workspace', 'Officer Workspace');
      default: return t('farmer_workspace', 'Farmer Workspace');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Left Side: Mobile Toggle & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-lg ml-4 font-bold text-slate-800 dark:text-white hidden sm:block">
            {getWorkspaceTitle()}
          </h1>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-white dark:bg-zinc-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('am')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'am' ? 'bg-white dark:bg-zinc-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              AM
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-accent-300 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Chat Button */}
          <div className="relative flex items-center justify-center p-1">
            <ChatButton />
          </div>

          {/* Notifications */}
          <div className="relative flex items-center justify-center p-1">
            <NotificationBell />
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-zinc-700 hidden sm:block mx-2"></div>

          {/* My Profile Button */}
          <Link
            to="/profile"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <UserOutlined className="w-4 h-4" />
            {t('my_profile', 'My Profile')}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            {t('logout', 'Logout')}
          </button>
        </div>
      </div>
    </header>
  );
}

import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationProvider } from '../../context/NotificationContext';
import { ChatProvider } from '../../context/ChatContext';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <NotificationProvider>
      <ChatProvider>
        <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-accent-200 selection:text-primary-900 flex transition-colors duration-300">
          
          {/* Sidebar Component */}
          <Sidebar isOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 md:ml-64 w-full md:w-[calc(100%-16rem)] transition-all">
            
            {/* Top Navbar Component */}
            <TopNavbar setSidebarOpen={setSidebarOpen} />

            {/* WORKSPACE CONTENT AREA */}
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col relative z-0">
              
              {/* Router Content Container */}
              <div className="flex-1 w-full">
                <Outlet />
              </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-white/50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 text-xs py-4 px-4 sm:px-8 border-t border-slate-200 dark:border-zinc-800 mt-auto w-full transition-colors">
              <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 dark:text-white font-extrabold tracking-tight text-sm">
                    {t('app_name_short', 'ias.')}
                  </span>
                  <span className="text-slate-300 dark:text-zinc-600">|</span>
                  <span>© {new Date().getFullYear()} {t('app_name', 'Integrated Agriculture System')}. {t('all_rights_reserved', 'All rights reserved.')}</span>
                </div>
                <div className="flex gap-4 font-medium">
                  <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('privacy', 'Privacy')}</a>
                  <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('terms', 'Terms')}</a>
                  <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('support', 'Support')}</a>
                </div>
              </div>
            </footer>

          </div>
        </div>
      </ChatProvider>
    </NotificationProvider>
  );
}

export default DashboardLayout;


import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Bell, FileText, Settings, Menu, X, 
  ChevronRight, LogOut, ExternalLink, Download 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: 'Projetos', icon: LayoutGrid, path: '/projects' },
    { label: 'Lembretes', icon: Bell, path: '/reminders' },
    { label: 'Log de Tarefas', icon: FileText, path: '/logs' },
    { label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex-shrink-0
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size={42} />
              <div>
                <h1 className="text-xl font-black tracking-tighter leading-none brand uppercase">PROJECT<br/>MANAGER</h1>
                <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mt-1">Powered by JOI.A.</p>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 space-y-1 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${location.pathname.startsWith(item.path) 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-600/10 dark:text-indigo-400 font-semibold' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {location.pathname.startsWith(item.path) && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-500 mb-2">Usuário Demo</p>
              <button 
                onClick={() => {
                   localStorage.removeItem('demo_auth');
                   window.location.reload();
                }}
                className="flex items-center space-x-2 text-red-500 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                <LogOut size={16} />
                <span>Encerrar Sessão</span>
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-400">v1.1.1 &copy; 2024</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">Powered by JOI.A.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
             <Logo size={28} />
             <h2 className="text-lg font-black tracking-tighter brand">PROJECT MANAGER</h2>
          </div>
          <div className="w-6" />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

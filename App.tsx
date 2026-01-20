
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { ProjectList } from './views/ProjectList.tsx';
import { ProjectDetail } from './views/ProjectDetail.tsx';
import { Reminders } from './views/Reminders.tsx';
import { Logs } from './views/Logs.tsx';
import { Settings } from './views/Settings.tsx';
import { Login } from './views/Login.tsx';
import { LoadingScreen } from './components/LoadingScreen.tsx';
import { FirestoreService } from './services/firestoreService.ts';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isBlocked, setIsBlocked] = useState(false);

  const checkStatus = async () => {
    const isHealthy = await FirestoreService.checkHealth();
    setIsBlocked(!isHealthy);
  };

  useEffect(() => {
    const init = async () => {
      await checkStatus();

      const settings = await FirestoreService.getSettings();
      if (settings) {
        setTheme(settings.theme);
        document.documentElement.classList.toggle('dark', settings.theme === 'dark');
        document.documentElement.style.setProperty('--font-scale', `${settings.fontScale}%`);
      }

      const demoAuth = localStorage.getItem('demo_auth');
      if (demoAuth === 'true') setIsAuth(true);
      
      setIsLoading(false);
    };
    init();

    const interval = setInterval(() => {
        if (isBlocked) checkStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [isBlocked]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      {isBlocked && (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] bg-red-600 text-white p-4 md:p-6 rounded-[2rem] shadow-2xl flex items-center justify-between border-2 border-white/20 animate-in slide-in-from-bottom-4 backdrop-blur-md bg-opacity-95">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center animate-pulse">
                <AlertTriangle size={24} />
            </div>
            <div className="text-xs font-bold leading-tight uppercase tracking-tighter">
              <p className="text-sm font-black mb-1">Acesso ao Banco Bloqueado</p>
              <p className="opacity-80 font-medium normal-case">Mude 'if false;' para 'if true;' no Console Firebase > Rules e clique em PUBLICAR.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={checkStatus} 
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span className="hidden md:inline text-[10px] font-black uppercase">Testar Agora</span>
            </button>
            <button onClick={() => setIsBlocked(false)} className="p-3 hover:bg-white/10 rounded-xl">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
        
        {isAuth ? (
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="projects" element={<ProjectList />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="reminders" element={<Reminders />} />
                <Route path="logs" element={<Logs />} />
                <Route path="settings" element={<Settings setTheme={setTheme} />} />
                <Route path="*" element={<Navigate to="/projects" replace />} />
              </Routes>
            </Layout>
          } />
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;

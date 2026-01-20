
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProjectList } from './views/ProjectList';
import { ProjectDetail } from './views/ProjectDetail';
import { Reminders } from './views/Reminders';
import { Logs } from './views/Logs';
import { Settings } from './views/Settings';
import { Login } from './views/Login';
import { LoadingScreen } from './components/LoadingScreen';
import { FirestoreService, isFirestoreBlocked } from './services/firestoreService';
import { AlertTriangle, X } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Testar saúde do Firestore antes de tudo
      await FirestoreService.checkHealth();
      
      if (isFirestoreBlocked) {
        setShowWarning(true);
      }

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
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      {showWarning && (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white/20 animate-in slide-in-from-bottom-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="flex-shrink-0" />
            <div className="text-xs font-bold leading-tight">
              <p className="uppercase tracking-widest">Acesso ao Banco Bloqueado</p>
              <p className="opacity-80 font-medium">Mude 'if false;' para 'if true;' no Console Firebase > Rules e clique em PUBLICAR.</p>
            </div>
          </div>
          <button onClick={() => setShowWarning(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X size={16} />
          </button>
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

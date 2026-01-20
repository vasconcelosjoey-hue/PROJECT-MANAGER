
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
import { FirestoreService } from './services/firestoreService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Sequência de carregamento inicial
    const init = async () => {
      // Reduzido de 2500ms para 800ms para maior agilidade
      const timer = new Promise(r => setTimeout(r, 800));
      
      const settingsPromise = FirestoreService.getSettings();
      
      // Aguarda ambos (o timer mínimo e a busca de configurações)
      const [settings] = await Promise.all([settingsPromise, timer]);

      if (settings) {
        setTheme(settings.theme);
        document.documentElement.classList.toggle('dark', settings.theme === 'dark');
        document.documentElement.style.setProperty('--font-scale', `${settings.fontScale}%`);
      } else {
        document.documentElement.classList.add('dark');
      }
      
      // Verificação de auth demo
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


import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Type, Bell, Shield, Smartphone, Download } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { messaging, getToken } from '../services/firebase';

interface SettingsProps {
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Settings: React.FC<SettingsProps> = ({ setTheme }) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const [fontScale, setFontScale] = useState(100);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const settings = await FirestoreService.getSettings();
      if (settings) {
        setCurrentTheme(settings.theme);
        setFontScale(settings.fontScale);
      }
    };
    load();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const handleThemeChange = async (t: 'light' | 'dark') => {
    setCurrentTheme(t);
    setTheme(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    await FirestoreService.updateSettings({ theme: t, fontScale });
  };

  const handleFontScaleChange = async (scale: number) => {
    setFontScale(scale);
    document.documentElement.style.setProperty('--font-scale', `${scale}%`);
    await FirestoreService.updateSettings({ theme: currentTheme, fontScale: scale });
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && messaging) {
        const token = await getToken(messaging, { 
          vapidKey: 'YOUR_VAPID_KEY_HERE' // Substitua pela chave do seu console Firebase
        });
        console.log('FCM Token:', token);
        alert('Notificações ativadas com sucesso!');
      } else {
        alert('Permissão de notificação negada ou não suportada.');
      }
    } catch (error) {
      console.error('Erro ao pedir permissão:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold brand uppercase tracking-tight">Configurações</h1>
        <p className="text-slate-500 font-medium">Personalize sua experiência premium.</p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-slate-400">
          <Monitor size={18} />
          <h2 className="text-xs font-black uppercase tracking-[0.2em]">Aparência</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${currentTheme === 'light' ? 'bg-white border-indigo-500 ring-4 ring-indigo-500/10' : 'bg-slate-200/50 dark:bg-slate-800/50 border-transparent'}`}
          >
            <div className="flex items-center space-x-4">
              <Sun size={24} className="text-orange-500" />
              <span className="font-bold">Modo Claro</span>
            </div>
          </button>

          <button 
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${currentTheme === 'dark' ? 'bg-slate-900 border-indigo-500 ring-4 ring-indigo-500/10' : 'bg-slate-800/50 border-transparent'}`}
          >
            <div className="flex items-center space-x-4 text-white">
              <Moon size={24} className="text-indigo-400" />
              <span className="font-bold">Modo Escuro</span>
            </div>
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-slate-400">
          <Type size={18} />
          <h2 className="text-xs font-black uppercase tracking-[0.2em]">Escala Visual</h2>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between gap-2">
            {[90, 100, 110, 120].map(scale => (
              <button 
                key={scale}
                onClick={() => handleFontScaleChange(scale)}
                className={`flex-1 py-4 rounded-2xl font-black transition-all ${fontScale === scale ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                {scale}%
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-slate-400">
          <Smartphone size={18} />
          <h2 className="text-xs font-black uppercase tracking-[0.2em]">App & Notificações</h2>
        </div>
        
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold">Push Notifications</h4>
                        <p className="text-xs text-slate-500">Alertas de prazos e entregas.</p>
                    </div>
                </div>
                <button 
                  onClick={requestNotificationPermission}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20"
                >
                    Ativar
                </button>
            </div>

            {installPrompt && (
              <div className="bg-indigo-600 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-xl shadow-indigo-600/30">
                  <div className="flex items-center space-x-4">
                      <Download size={24} />
                      <div>
                          <h4 className="font-bold">Instalar App</h4>
                          <p className="text-xs opacity-80">Acesso rápido na tela inicial.</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => installPrompt.prompt()}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl text-sm font-bold"
                  >
                      Instalar
                  </button>
              </div>
            )}
        </div>
      </section>

      <div className="text-center py-8">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">PROJECT MANAGER &bull; Powered by JOI.A.</p>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Type, Bell, Shield, Smartphone } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';

interface SettingsProps {
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Settings: React.FC<SettingsProps> = ({ setTheme }) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const [fontScale, setFontScale] = useState(100);

  useEffect(() => {
    const load = async () => {
      const settings = await FirestoreService.getSettings();
      if (settings) {
        setCurrentTheme(settings.theme);
        setFontScale(settings.fontScale);
      }
    };
    load();
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

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold brand uppercase">Configurações</h1>
        <p className="text-slate-500">Personalize sua experiência no PROJECT MANAGER.</p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-slate-400">
          <Monitor size={18} />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Aparência</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => handleThemeChange('light')}
            className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${currentTheme === 'light' ? 'bg-white border-blue-500 ring-4 ring-blue-500/10' : 'bg-white/50 border-transparent grayscale opacity-60'}`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                <Sun size={20} />
              </div>
              <span className="font-bold">Modo Claro</span>
            </div>
            {currentTheme === 'light' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
          </button>

          <button 
            onClick={() => handleThemeChange('dark')}
            className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${currentTheme === 'dark' ? 'bg-slate-900 border-blue-500 ring-4 ring-blue-500/10' : 'bg-slate-800/50 border-transparent grayscale opacity-60'}`}
          >
            <div className="flex items-center space-x-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                <Moon size={20} />
              </div>
              <span className="font-bold">Modo Escuro</span>
            </div>
            {currentTheme === 'dark' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-slate-400">
          <Type size={18} />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Escala de Fonte</h2>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between mb-8">
            {[90, 100, 110, 120].map(scale => (
              <button 
                key={scale}
                onClick={() => handleFontScaleChange(scale)}
                className={`flex-1 mx-2 py-4 rounded-2xl font-bold transition-all ${fontScale === scale ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                {scale}%
              </button>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm italic">
            "Esta é uma prévia de como o texto será exibido no seu dashboard."
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-slate-400">
          <Smartphone size={18} />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Aplicativo e Notificações</h2>
        </div>
        
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold">Notificações Push</h4>
                        <p className="text-xs text-slate-500">Receba alertas de prazos no seu celular.</p>
                    </div>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                    Ativar
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold">Versão do App</h4>
                        <p className="text-xs text-slate-500">v1.1.1 (Beta Público)</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <div className="text-center py-8">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">PROJECT MANAGER &bull; Powered by JOI.A.</p>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, FileText } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { TaskLog } from '../types';

export const Logs: React.FC = () => {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await FirestoreService.getLogs();
      setLogs(data);
    };
    load();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand">Log de Tarefas</h1>
          <p className="text-slate-500">Histórico detalhado de todas as ações e alterações.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Pesquisar no histórico..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400">
          <Filter size={18} />
          <span>Filtrar</span>
        </button>
      </div>

      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500">Nenhum log encontrado.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start space-x-4">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{log.title}</h4>
                  <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} className="mr-1" />
                    Agorinha
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {log.details}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

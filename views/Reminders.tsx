
import React, { useState, useEffect } from 'react';
import { Bell, Plus, Calendar, Clock, Tag, CheckCircle2, X } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService.ts';
import { Reminder, ReminderPriority, ReminderStatus } from '../types.ts';

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'overdue'>('today');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');

  const loadReminders = async () => {
    const data = await FirestoreService.getReminders();
    setReminders(data);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    
    await FirestoreService.addReminder({
      title: newTitle,
      details: newDetails,
      targetType: 'general',
      remindAt: new Date(),
      priority: ReminderPriority.MED,
      status: ReminderStatus.ACTIVE
    });

    setNewTitle('');
    setNewDetails('');
    setIsAdding(false);
    loadReminders();

    await FirestoreService.addLog({
      title: 'Lembrete Criado',
      details: `Novo lembrete: "${newTitle}"`
    });
  };

  const toggleDone = async (id: string, currentStatus: ReminderStatus) => {
    const nextStatus = currentStatus === ReminderStatus.DONE ? ReminderStatus.ACTIVE : ReminderStatus.DONE;
    await FirestoreService.updateReminder(id, { status: nextStatus });
    loadReminders();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand uppercase">Lembretes</h1>
          <p className="text-slate-500">Mantenha-se no controle dos seus prazos críticos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Lembrete</span>
        </button>
      </div>

      <div className="flex space-x-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
        {(['today', 'upcoming', 'overdue'] as const).map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
          >
            {f === 'today' ? 'Hoje' : f === 'upcoming' ? 'Próximos 7 Dias' : 'Atrasados'}
          </button>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleAddReminder} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold brand">Criar Lembrete</h3>
                <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Título</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  placeholder="Ex: Revisar contrato"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Detalhes (Opcional)</label>
                <textarea 
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                  placeholder="Mais informações..."
                  value={newDetails}
                  onChange={e => setNewDetails(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
            >
              Salvar Lembrete (Enter)
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                <Bell size={32} />
            </div>
            <p className="text-slate-500">Tudo em dia! Nenhum lembrete para este período.</p>
          </div>
        ) : (
          reminders.map(rem => (
            <div key={rem.id} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all border-l-4 ${rem.status === ReminderStatus.DONE ? 'opacity-50 border-l-green-500' : 'border-l-orange-500'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${rem.status === ReminderStatus.DONE ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        <Bell size={20} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${rem.priority === ReminderPriority.HIGH ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        {rem.priority}
                    </span>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${rem.status === ReminderStatus.DONE ? 'line-through' : ''}`}>{rem.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{rem.details || 'Sem detalhes.'}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2 text-slate-400">
                        <Clock size={14} />
                        <span className="text-xs font-semibold">Hoje</span>
                    </div>
                    <button 
                      onClick={() => toggleDone(rem.id, rem.status)}
                      className={`transition-colors ${rem.status === ReminderStatus.DONE ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'}`}
                    >
                        <CheckCircle2 size={24} />
                    </button>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

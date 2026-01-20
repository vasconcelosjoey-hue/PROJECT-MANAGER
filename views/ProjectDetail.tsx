
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Plus, ChevronDown, ChevronUp, 
    CheckCircle2, Circle, Edit2, Trash2, Calendar, Clock, AlertTriangle, X
} from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { Project, Phase, Subphase } from '../types';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [subphases, setSubphases] = useState<Record<string, Subphase[]>>({});
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  
  const [addingSubphaseTo, setAddingSubphaseTo] = useState<string | null>(null);
  const [newSubTitle, setNewSubTitle] = useState('');

  const loadSubphases = useCallback(async (phaseId: string) => {
    const data = await FirestoreService.getSubphases(phaseId);
    setSubphases(prev => ({ ...prev, [phaseId]: data }));
  }, []);

  const loadData = useCallback(async () => {
    if (!id) return;
    const projects = await FirestoreService.getProjects();
    const current = projects.find(p => p.id === id);
    if (!current) {
        navigate('/projects');
        return;
    }
    setProject(current);
    const phaseData = await FirestoreService.getPhases(id);
    setPhases(phaseData);
    
    // Load subphases for expanded ones
    for (const p of phaseData) {
        if (expandedPhases.includes(p.id)) {
            loadSubphases(p.id);
        }
    }
  }, [id, expandedPhases, loadSubphases, navigate]);

  useEffect(() => {
    loadData();
  }, [id, loadData]);

  const togglePhase = (phaseId: string) => {
    const isNowExpanded = !expandedPhases.includes(phaseId);
    setExpandedPhases(prev => 
      isNowExpanded ? [...prev, phaseId] : prev.filter(p => p !== phaseId)
    );
    if (isNowExpanded) loadSubphases(phaseId);
  };

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newPhaseTitle) return;
    await FirestoreService.addPhase({
      projectId: id,
      title: newPhaseTitle,
      done: false,
      orderIndex: phases.length,
      startAt: new Date(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    setNewPhaseTitle('');
    setIsAddingPhase(false);
    loadData();
  };

  const handleAddSubphase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingSubphaseTo || !newSubTitle) return;
    await FirestoreService.addSubphase({
      phaseId: addingSubphaseTo,
      title: newSubTitle,
      done: false,
      orderIndex: (subphases[addingSubphaseTo]?.length || 0),
      startAt: new Date(),
      endAt: new Date()
    });
    setNewSubTitle('');
    setAddingSubphaseTo(null);
    loadSubphases(addingSubphaseTo);
  };

  const handleTogglePhaseDone = async (phaseId: string, currentStatus: boolean) => {
    await FirestoreService.updatePhase(phaseId, { done: !currentStatus });
    loadData();
  };

  const handleToggleSubDone = async (phaseId: string, subId: string, current: boolean) => {
    await FirestoreService.updateSubphase(subId, { done: !current });
    loadSubphases(phaseId);
  };

  const calculateProjectProgress = () => {
    if (phases.length === 0) return 0;
    const done = phases.filter(p => p.done).length;
    return Math.round((done / phases.length) * 100);
  };

  if (!project) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/projects')}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold brand uppercase tracking-tight">{project.name}</h1>
          <p className="text-slate-500 flex items-center text-sm">
            <span className={`w-2 h-2 rounded-full mr-2 ${project.status === 'Ativo' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
            {project.status}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold brand uppercase tracking-wider text-slate-400">Fases do Projeto</h2>
            <button 
              onClick={() => setIsAddingPhase(true)}
              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 hover:opacity-80 transition-all"
            >
              <Plus size={16} />
              <span>Adicionar Fase</span>
            </button>
          </div>

          <div className="space-y-3">
            {phases.map(phase => {
              const isExpanded = expandedPhases.includes(phase.id);
              const subs = subphases[phase.id] || [];
              const doneSubs = subs.filter(s => s.done).length;

              return (
                <div key={phase.id} className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500/30 ring-1 ring-indigo-500/10 shadow-lg' : 'border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                  <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => togglePhase(phase.id)}>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleTogglePhaseDone(phase.id, phase.done); }}
                        className={`transition-all transform active:scale-90 ${phase.done ? 'text-green-500' : 'text-slate-300 dark:text-slate-700 hover:text-indigo-500'}`}
                      >
                        {phase.done ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                      </button>
                      <div>
                        <h3 className={`font-bold text-lg ${phase.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                          {phase.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          <span className="flex items-center"><Calendar size={12} className="mr-1" /> Entrega: 20 Out</span>
                          {subs.length > 0 && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-500">{doneSubs}/{subs.length} subs</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2">
                       <div className="h-px bg-slate-100 dark:bg-slate-800 mb-5" />
                       
                       <div className="space-y-4">
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                             {phase.notes || 'Sem observações adicionais.'}
                          </p>

                          <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 space-y-3">
                             <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-2">
                                <span>Subfases Internas</span>
                                <button 
                                  onClick={() => setAddingSubphaseTo(phase.id)}
                                  className="text-indigo-500 hover:scale-110 transition-transform"
                                >
                                    <Plus size={18} />
                                </button>
                             </div>
                             
                             <div className="space-y-2">
                                {subs.length === 0 ? (
                                    <p className="text-center py-4 text-slate-400 text-xs italic">Nenhuma subfase. Clique em (+) para adicionar.</p>
                                ) : (
                                    subs.map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => handleToggleSubDone(phase.id, sub.id, sub.done)}>
                                                    {sub.done ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-slate-300" />}
                                                </button>
                                                <span className={`text-sm font-semibold ${sub.done ? 'line-through text-slate-400' : ''}`}>{sub.title}</span>
                                            </div>
                                            <button className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))
                                )}
                             </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                             <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><Edit2 size={18} /></button>
                             <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Phase Modal-like Card */}
          {isAddingPhase && (
            <form onSubmit={handleAddPhase} className="bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-500/30 rounded-3xl p-6 animate-in zoom-in-95">
                <label className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2 block">Nome da Nova Fase</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                  placeholder="Ex: Protótipo de Alta Fidelidade"
                  value={newPhaseTitle}
                  onChange={e => setNewPhaseTitle(e.target.value)}
                />
                <div className="flex space-x-3 mt-4">
                    <button type="button" onClick={() => setIsAddingPhase(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-white dark:bg-slate-900 rounded-2xl">Cancelar</button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/20">Salvar Fase (Enter)</button>
                </div>
            </form>
          )}

          {/* Add Subphase Popup */}
          {addingSubphaseTo && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                  <form onSubmit={handleAddSubphase} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl space-y-6">
                      <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold brand">Nova Subfase</h3>
                          <button type="button" onClick={() => setAddingSubphaseTo(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                      </div>
                      <input 
                        autoFocus
                        required
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                        placeholder="Nome da subfase..."
                        value={newSubTitle}
                        onChange={e => setNewSubTitle(e.target.value)}
                      />
                      <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">Confirmar (Enter)</button>
                  </form>
              </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-8">
              <h3 className="text-lg font-bold brand mb-6 uppercase tracking-widest text-slate-400">Resumo Geral</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    <span>Status de Conclusão</span>
                    <span className="text-indigo-500">{calculateProjectProgress()}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${calculateProjectProgress()}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fases</p>
                    <p className="text-3xl font-black brand">{phases.length}</p>
                  </div>
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-3xl text-center border border-indigo-100 dark:border-indigo-900/20">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Finalizadas</p>
                    <p className="text-3xl font-black text-indigo-600 brand">{phases.filter(p => p.done).length}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Membros Ativos</h4>
                  <div className="flex -space-x-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-white">JD</div>
                     <div className="w-10 h-10 rounded-full bg-purple-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-white">PM</div>
                     <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-slate-500">+</div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

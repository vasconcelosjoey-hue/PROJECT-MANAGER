
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Plus, ChevronDown, ChevronUp, 
    CheckCircle2, Circle, Edit2, Trash2, Calendar, Clock, AlertTriangle 
} from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { Project, Phase, Subphase } from '../types';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) ? prev.filter(p => p !== phaseId) : [...prev, phaseId]
    );
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

  const handleToggleDone = async (phaseId: string, currentStatus: boolean) => {
    await FirestoreService.updatePhase(phaseId, { done: !currentStatus });
    loadData();
  };

  if (!project) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/projects')}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold brand">{project.name}</h1>
          <p className="text-slate-500 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            {project.status}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Phases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold brand">Fases do Projeto</h2>
            <button 
              onClick={() => setIsAddingPhase(true)}
              className="text-blue-500 hover:text-blue-600 font-bold flex items-center space-x-1"
            >
              <Plus size={18} />
              <span>Adicionar Fase</span>
            </button>
          </div>

          {phases.length === 0 && !isAddingPhase && (
             <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-500">Nenhuma fase definida para este projeto.</p>
             </div>
          )}

          <div className="space-y-3">
            {phases.map(phase => {
              const isExpanded = expandedPhases.includes(phase.id);
              const isLate = !phase.done && phase.endAt?.toDate && phase.endAt.toDate() < new Date();

              return (
                <div key={phase.id} className={`bg-white dark:bg-slate-900 rounded-3xl border ${isExpanded ? 'border-blue-500/30 ring-1 ring-blue-500/10' : 'border-slate-200 dark:border-slate-800'} transition-all overflow-hidden`}>
                  <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => togglePhase(phase.id)}>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleDone(phase.id, phase.done); }}
                        className={`transition-colors ${phase.done ? 'text-green-500' : 'text-slate-300 dark:text-slate-700 hover:text-blue-500'}`}
                      >
                        {phase.done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      <div>
                        <h3 className={`font-bold transition-all ${phase.done ? 'line-through text-slate-400' : ''}`}>
                          {phase.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                          <span className="flex items-center"><Calendar size={10} className="mr-1" /> 12 Out</span>
                          {isLate && <span className="text-red-500 flex items-center"><AlertTriangle size={10} className="mr-1" /> Atrasado</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">0/0</span>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2">
                       <div className="h-px bg-slate-100 dark:bg-slate-800 mb-5" />
                       
                       <div className="space-y-3">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                             {phase.notes || 'Nenhuma observação.'}
                          </p>

                          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 space-y-3">
                             <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                                <span>Subfases</span>
                                <Plus size={16} className="cursor-pointer hover:text-blue-500" />
                             </div>
                             <div className="text-center py-4 text-slate-400 text-xs italic">
                                Nenhuma subfase adicionada.
                             </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-4">
                             <button className="flex items-center space-x-1 px-3 py-2 text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <Edit2 size={14} /> <span>Editar</span>
                             </button>
                             <button className="flex items-center space-x-1 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <Trash2 size={14} /> <span>Excluir</span>
                             </button>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isAddingPhase && (
            <form onSubmit={handleAddPhase} className="bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-500/30 rounded-3xl p-6 animate-in zoom-in-95">
                <input 
                  autoFocus
                  className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  placeholder="Título da Nova Fase..."
                  value={newPhaseTitle}
                  onChange={e => setNewPhaseTitle(e.target.value)}
                />
                <div className="flex space-x-3 mt-4">
                    <button type="button" onClick={() => setIsAddingPhase(false)} className="flex-1 py-3 text-sm font-bold text-slate-500">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20">Criar Fase</button>
                </div>
            </form>
          )}
        </div>

        {/* Right Col: Summary */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold brand mb-6">Resumo</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <span>Progresso do Projeto</span>
                    <span className="text-blue-500">0%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: '0%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fases</p>
                    <p className="text-2xl font-black">{phases.length}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Concluídas</p>
                    <p className="text-2xl font-black text-green-500">{phases.filter(p => p.done).length}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Atividade Recente</h4>
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Plus size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">Projeto visualizado</p>
                        <p className="text-[10px] text-slate-400">Agora mesmo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

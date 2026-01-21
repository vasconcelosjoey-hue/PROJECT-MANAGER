
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ExternalLink, Calendar, LayoutGrid, X, Loader2 } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService.ts';
import { Project, ProjectStatus } from '../types.ts';
import { Link } from 'react-router-dom';

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');

  const loadProjects = async () => {
    const data = await FirestoreService.getProjects();
    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await FirestoreService.addProject({
        name: newName,
        status: ProjectStatus.ACTIVE,
        orderIndex: projects.length,
      });
      
      await FirestoreService.addLog({
          title: 'Projeto Criado',
          details: `Projeto "${newName}" iniciado com sucesso.`
      });

      setNewName('');
      setIsAdding(false);
      loadProjects();
    } catch (error: any) {
      console.error("Erro na UI ao adicionar:", error);
      alert(`Erro ao salvar: ${error?.message || 'Verifique sua conexão ou as regras do banco.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Atenção! Excluir "${name}" apagará todas as fases. Confirmar?`)) {
      await FirestoreService.deleteProject(id);
      loadProjects();
      await FirestoreService.addLog({
          title: 'Projeto Excluído',
          details: `Projeto "${name}" foi removido do sistema.`
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black brand tracking-tighter uppercase">Meus Projetos</h1>
          <p className="text-slate-500 font-medium">Atualmente gerenciando {projects.length} fluxos de trabalho.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Criar Novo</span>
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <form onSubmit={handleAddProject} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black brand uppercase tracking-tighter">Novo Projeto</h3>
                <button 
                  type="button" 
                  disabled={isSubmitting}
                  onClick={() => setIsAdding(false)} 
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  <X size={28} />
                </button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-1">Identificação do Projeto</label>
              <input 
                autoFocus
                required
                disabled={isSubmitting}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-3xl p-5 focus:ring-4 focus:ring-indigo-500/20 outline-none font-bold text-lg disabled:opacity-50"
                placeholder="Ex: Redesign E-commerce 2.0"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <button 
                type="submit"
                disabled={isSubmitting || !newName.trim()}
                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:bg-slate-400 disabled:shadow-none"
            >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Gravando Dados...</span>
                  </>
                ) : (
                  <span>Salvar Projeto (Enter)</span>
                )}
            </button>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800/50">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <LayoutGrid size={40} />
          </div>
          <h3 className="text-2xl font-black mb-2 brand uppercase">Aguardando Início</h3>
          <p className="text-slate-500 max-w-xs mx-auto font-medium">Seu dashboard está vazio. Clique em "Criar Novo" para começar agora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                  project.status === ProjectStatus.ACTIVE ? 'bg-green-100 text-green-600 dark:bg-green-600/10' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                }`}>
                  {project.status}
                </span>
                <button onClick={() => handleDelete(project.id, project.name)} className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
              
              <Link to={`/projects/${project.id}`} className="block flex-1">
                <h3 className="text-2xl font-black mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors brand uppercase leading-tight tracking-tighter">
                    {project.name}
                </h3>
                
                <div className="space-y-6 mt-8">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 px-1">
                      <span className="text-slate-400">Status Geral</span>
                      <span className="text-indigo-600">--%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Calendar size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Acessar Painel</span>
                    </div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                      <ExternalLink size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

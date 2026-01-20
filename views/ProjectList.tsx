
import React, { useState, useEffect } from 'react';
// Added LayoutGrid to imports
import { Plus, MoreVertical, Edit3, Trash2, ExternalLink, Calendar, CheckCircle2, LayoutGrid } from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';
import { Project, ProjectStatus } from '../types';
import { Link } from 'react-router-dom';

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
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
    if (!newName) return;
    await FirestoreService.addProject({
      name: newName,
      status: ProjectStatus.ACTIVE,
      orderIndex: projects.length,
    });
    setNewName('');
    setIsAdding(false);
    loadProjects();
    
    await FirestoreService.addLog({
        title: 'Novo Projeto',
        details: `Projeto "${newName}" criado.`
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Excluir projeto "${name}"? Todas as fases serão perdidas.`)) {
      await FirestoreService.deleteProject(id);
      loadProjects();
      await FirestoreService.addLog({
          title: 'Projeto Excluído',
          details: `Projeto "${name}" removido.`
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand">Meus Projetos</h1>
          <p className="text-slate-500 dark:text-slate-400">Você tem {projects.length} projetos ativos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Novo Projeto</span>
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleAddProject} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6">
            <h3 className="text-2xl font-bold brand">Criar Projeto</h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Nome do Projeto</label>
              <input 
                autoFocus
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: App de Delivery"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            {/* Added missing import for LayoutGrid */}
            <LayoutGrid size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Nenhum projeto ainda</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Comece criando seu primeiro projeto para gerenciar suas entregas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 relative flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  project.status === ProjectStatus.ACTIVE ? 'bg-green-100 text-green-600 dark:bg-green-600/10' : 'bg-slate-100 text-slate-600'
                }`}>
                  {project.status}
                </span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-500">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(project.id, project.name)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <Link to={`/projects/${project.id}`} className="block flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">{project.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
                  {project.description || 'Sem descrição.'}
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Progresso Geral</span>
                    <span className="text-blue-500">65%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-xs">Marco: 12 Out</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-500 font-bold text-xs uppercase tracking-tighter">
                      <span>Ver Detalhes</span>
                      <ExternalLink size={14} />
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

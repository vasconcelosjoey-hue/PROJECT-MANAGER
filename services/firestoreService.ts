
import { 
  db, collection, doc, setDoc, getDoc, getDocs, query, 
  where, orderBy, updateDoc, deleteDoc, addDoc, serverTimestamp 
} from './firebase';
import { Project, Phase, Subphase, TaskLog, Reminder, UserSettings } from '../types';

const DEMO_USER_ID = "demo";

// Sistema de monitoramento de saúde do Firestore
export const FirestoreService = {
  checkHealth: async (): Promise<boolean> => {
    try {
      if (!db) return false;
      // Tentativa de leitura em uma coleção qualquer para testar permissão
      const q = query(collection(db, 'projects'), where('ownerId', '==', 'health-check'), orderBy('orderIndex'));
      await getDocs(q);
      return true; // Se não lançou erro, o acesso está liberado
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        return false;
      }
      return true; // Outros erros (offline) não significam bloqueio de regra
    }
  },

  getProjects: async (): Promise<Project[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'projects'), where('ownerId', '==', DEMO_USER_ID), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    } catch (e) {
      console.error("Erro ao buscar projetos:", e);
      return [];
    }
  },

  addProject: async (project: Partial<Project>) => {
    try {
      if (!db) return null;
      return await addDoc(collection(db, 'projects'), {
        ...project,
        ownerId: DEMO_USER_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        orderIndex: project.orderIndex || 0
      });
    } catch (e) {
      console.error("Erro ao adicionar projeto:", e);
      return null;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    try {
      const ref = doc(db, 'projects', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      console.error("Erro ao atualizar projeto:", e);
      return null;
    }
  },

  deleteProject: async (id: string) => {
    try {
      return await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      console.error("Erro ao excluir projeto:", e);
      return null;
    }
  },

  getPhases: async (projectId: string): Promise<Phase[]> => {
    try {
      const q = query(collection(db, 'phases'), where('projectId', '==', projectId), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Phase));
    } catch (e) {
      console.error("Erro ao buscar fases:", e);
      return [];
    }
  },

  addPhase: async (phase: Partial<Phase>) => {
    try {
      return await addDoc(collection(db, 'phases'), {
        ...phase,
        ownerId: DEMO_USER_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Erro ao adicionar fase:", e);
      return null;
    }
  },

  updatePhase: async (id: string, data: Partial<Phase>) => {
    try {
      const ref = doc(db, 'phases', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      console.error("Erro ao atualizar fase:", e);
      return null;
    }
  },

  deletePhase: async (id: string) => {
    try {
      return await deleteDoc(doc(db, 'phases', id));
    } catch (e) {
      console.error("Erro ao excluir fase:", e);
      return null;
    }
  },

  getSubphases: async (phaseId: string): Promise<Subphase[]> => {
    try {
      const q = query(collection(db, 'subphases'), where('phaseId', '==', phaseId), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subphase));
    } catch (e) {
      console.error("Erro ao buscar subfases:", e);
      return [];
    }
  },

  addSubphase: async (sub: Partial<Subphase>) => {
    try {
      return await addDoc(collection(db, 'subphases'), {
        ...sub,
        ownerId: DEMO_USER_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Erro ao adicionar subfase:", e);
      return null;
    }
  },

  updateSubphase: async (id: string, data: Partial<Subphase>) => {
    try {
      const ref = doc(db, 'subphases', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      console.error("Erro ao atualizar subfase:", e);
      return null;
    }
  },

  deleteSubphase: async (id: string) => {
    try {
      return await deleteDoc(doc(db, 'subphases', id));
    } catch (e) {
      console.error("Erro ao excluir subfase:", e);
      return null;
    }
  },

  getSettings: async (): Promise<UserSettings | null> => {
    try {
      const ref = doc(db, 'userSettings', DEMO_USER_ID);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() as UserSettings : { theme: 'dark', fontScale: 100 };
    } catch (e) {
      return { theme: 'dark', fontScale: 100 };
    }
  },

  updateSettings: async (settings: UserSettings) => {
    try {
      const ref = doc(db, 'userSettings', DEMO_USER_ID);
      return await setDoc(ref, settings, { merge: true });
    } catch (e) {
      return null;
    }
  },

  getLogs: async (): Promise<TaskLog[]> => {
    try {
      const q = query(collection(db, 'taskLogs'), where('ownerId', '==', DEMO_USER_ID), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskLog));
    } catch (e) {
      return [];
    }
  },

  addLog: async (log: Partial<TaskLog>) => {
    try {
      return await addDoc(collection(db, 'taskLogs'), {
        ...log,
        ownerId: DEMO_USER_ID,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      return null;
    }
  },

  getReminders: async (): Promise<Reminder[]> => {
    try {
      const q = query(collection(db, 'reminders'), where('ownerId', '==', DEMO_USER_ID), orderBy('remindAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reminder));
    } catch (e) {
      return [];
    }
  },

  addReminder: async (rem: Partial<Reminder>) => {
    try {
      return await addDoc(collection(db, 'reminders'), {
        ...rem,
        ownerId: DEMO_USER_ID,
        status: 'active',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      return null;
    }
  },

  updateReminder: async (id: string, data: Partial<Reminder>) => {
    try {
      const ref = doc(db, 'reminders', id);
      return await updateDoc(ref, data);
    } catch (e) {
      return null;
    }
  },

  deleteReminder: async (id: string) => {
    try {
      return await deleteDoc(doc(db, 'reminders', id));
    } catch (e) {
      return null;
    }
  }
};

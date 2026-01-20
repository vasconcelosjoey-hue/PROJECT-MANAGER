
import { 
  db, collection, doc, setDoc, getDoc, getDocs, query, 
  where, orderBy, updateDoc, deleteDoc, addDoc, serverTimestamp 
} from './firebase';
import { Project, Phase, Subphase, TaskLog, Reminder, UserSettings } from '../types';

const DEMO_USER_ID = "demo";

// Sistema de monitoramento de saúde do Firestore
export let isFirestoreBlocked = false;

const handleFirestoreError = (error: any, context: string, fallback: any = []) => {
  if (!db) return fallback;
  
  if (error?.code === 'permission-denied') {
    isFirestoreBlocked = true;
    console.warn(`PM [${context}]: Acesso negado pelas regras do Firebase. Verifique as 'Rules'.`);
    // Retornamos o fallback silenciosamente para não travar a renderização do React
    return fallback;
  }

  if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
    console.debug(`PM [${context}]: Operando em cache offline.`);
    return fallback;
  }

  console.error(`PM [${context}] Erro:`, error);
  return fallback;
};

export const FirestoreService = {
  // Função para testar conexão rapidamente
  checkHealth: async () => {
    try {
      if (!db) return false;
      const ref = doc(db, 'healthCheck', 'test');
      await getDoc(ref);
      isFirestoreBlocked = false;
      return true;
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        isFirestoreBlocked = true;
        return false;
      }
      return true; // Outros erros (como offline) não significam bloqueio de regra
    }
  },

  getProjects: async (): Promise<Project[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'projects'), where('ownerId', '==', DEMO_USER_ID), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    } catch (e) {
      return handleFirestoreError(e, 'getProjects', []);
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
      return handleFirestoreError(e, 'addProject', null);
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'projects', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      return handleFirestoreError(e, 'updateProject', null);
    }
  },

  deleteProject: async (id: string) => {
    try {
      if (!db) return null;
      return await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      return handleFirestoreError(e, 'deleteProject', null);
    }
  },

  getPhases: async (projectId: string): Promise<Phase[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'phases'), where('projectId', '==', projectId), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Phase));
    } catch (e) {
      return handleFirestoreError(e, 'getPhases', []);
    }
  },

  addPhase: async (phase: Partial<Phase>) => {
    try {
      if (!db) return null;
      return await addDoc(collection(db, 'phases'), {
        ...phase,
        ownerId: DEMO_USER_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      return handleFirestoreError(e, 'addPhase', null);
    }
  },

  updatePhase: async (id: string, data: Partial<Phase>) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'phases', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      return handleFirestoreError(e, 'updatePhase', null);
    }
  },

  deletePhase: async (id: string) => {
    try {
      if (!db) return null;
      return await deleteDoc(doc(db, 'phases', id));
    } catch (e) {
      return handleFirestoreError(e, 'deletePhase', null);
    }
  },

  getSubphases: async (phaseId: string): Promise<Subphase[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'subphases'), where('phaseId', '==', phaseId), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subphase));
    } catch (e) {
      return handleFirestoreError(e, 'getSubphases', []);
    }
  },

  addSubphase: async (sub: Partial<Subphase>) => {
    try {
      if (!db) return null;
      return await addDoc(collection(db, 'subphases'), {
        ...sub,
        ownerId: DEMO_USER_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      return handleFirestoreError(e, 'addSubphase', null);
    }
  },

  updateSubphase: async (id: string, data: Partial<Subphase>) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'subphases', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      return handleFirestoreError(e, 'updateSubphase', null);
    }
  },

  deleteSubphase: async (id: string) => {
    try {
      if (!db) return null;
      return await deleteDoc(doc(db, 'subphases', id));
    } catch (e) {
      return handleFirestoreError(e, 'deleteSubphase', null);
    }
  },

  getSettings: async (): Promise<UserSettings | null> => {
    try {
      if (!db) return null;
      const ref = doc(db, 'userSettings', DEMO_USER_ID);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() as UserSettings : { theme: 'dark', fontScale: 100 };
    } catch (e) {
      return handleFirestoreError(e, 'getSettings', { theme: 'dark', fontScale: 100 });
    }
  },

  updateSettings: async (settings: UserSettings) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'userSettings', DEMO_USER_ID);
      return await setDoc(ref, settings, { merge: true });
    } catch (e) {
      return handleFirestoreError(e, 'updateSettings', null);
    }
  },

  getLogs: async (): Promise<TaskLog[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'taskLogs'), where('ownerId', '==', DEMO_USER_ID), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskLog));
    } catch (e) {
      return handleFirestoreError(e, 'getLogs', []);
    }
  },

  addLog: async (log: Partial<TaskLog>) => {
    try {
      if (!db) return null;
      return await addDoc(collection(db, 'taskLogs'), {
        ...log,
        ownerId: DEMO_USER_ID,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      return handleFirestoreError(e, 'addLog', null);
    }
  },

  getReminders: async (): Promise<Reminder[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'reminders'), where('ownerId', '==', DEMO_USER_ID), orderBy('remindAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reminder));
    } catch (e) {
      return handleFirestoreError(e, 'getReminders', []);
    }
  },

  addReminder: async (rem: Partial<Reminder>) => {
    try {
      if (!db) return null;
      return await addDoc(collection(db, 'reminders'), {
        ...rem,
        ownerId: DEMO_USER_ID,
        status: 'active',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      return handleFirestoreError(e, 'addReminder', null);
    }
  },

  updateReminder: async (id: string, data: Partial<Reminder>) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'reminders', id);
      return await updateDoc(ref, data);
    } catch (e) {
      return handleFirestoreError(e, 'updateReminder', null);
    }
  },

  deleteReminder: async (id: string) => {
    try {
      if (!db) return null;
      return await deleteDoc(doc(db, 'reminders', id));
    } catch (e) {
      return handleFirestoreError(e, 'deleteReminder', null);
    }
  }
};

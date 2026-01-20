
import { 
  db, collection, doc, setDoc, getDoc, getDocs, query, 
  where, orderBy, updateDoc, deleteDoc, addDoc, serverTimestamp 
} from './firebase';
import { Project, Phase, Subphase, TaskLog, Reminder, UserSettings } from '../types';

const DEMO_USER_ID = "demo";

const handleFirestoreError = (error: any, fallback: any = []) => {
  // Se db for null (falha na config), usamos o fallback sem estourar erro no console
  if (!db) return fallback;
  
  if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
    console.debug("Offline: Buscando dados do cache local.");
    return fallback;
  }
  
  if (error?.code === 'permission-denied') {
    console.warn("Firestore: Chaves inválidas ou permissão negada. Verifique seu console Firebase.");
    return fallback;
  }

  console.error("Firestore Error:", error);
  return fallback;
};

export const FirestoreService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'projects'), where('ownerId', '==', DEMO_USER_ID), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    } catch (e) {
      return handleFirestoreError(e, []);
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
      });
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'projects', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  deleteProject: async (id: string) => {
    try {
      if (!db) return null;
      return await deleteDoc(doc(db, 'projects', id));
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  getPhases: async (projectId: string): Promise<Phase[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'phases'), where('projectId', '==', projectId), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Phase));
    } catch (e) {
      return handleFirestoreError(e, []);
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
      return handleFirestoreError(e, null);
    }
  },

  updatePhase: async (id: string, data: Partial<Phase>) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'phases', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  deletePhase: async (id: string) => {
    try {
      if (!db) return null;
      return await deleteDoc(doc(db, 'phases', id));
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  getSubphases: async (phaseId: string): Promise<Subphase[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'subphases'), where('phaseId', '==', phaseId), orderBy('orderIndex'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subphase));
    } catch (e) {
      return handleFirestoreError(e, []);
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
      return handleFirestoreError(e, null);
    }
  },

  updateSubphase: async (id: string, data: Partial<Subphase>) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'subphases', id);
      return await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  deleteSubphase: async (id: string) => {
    try {
      if (!db) return null;
      return await deleteDoc(doc(db, 'subphases', id));
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  getSettings: async (): Promise<UserSettings | null> => {
    try {
      if (!db) return null;
      const ref = doc(db, 'userSettings', DEMO_USER_ID);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() as UserSettings : null;
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  updateSettings: async (settings: UserSettings) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'userSettings', DEMO_USER_ID);
      return await setDoc(ref, settings, { merge: true });
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  getLogs: async (): Promise<TaskLog[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'taskLogs'), where('ownerId', '==', DEMO_USER_ID), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskLog));
    } catch (e) {
      return handleFirestoreError(e, []);
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
      return handleFirestoreError(e, null);
    }
  },

  getReminders: async (): Promise<Reminder[]> => {
    try {
      if (!db) return [];
      const q = query(collection(db, 'reminders'), where('ownerId', '==', DEMO_USER_ID), orderBy('remindAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reminder));
    } catch (e) {
      return handleFirestoreError(e, []);
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
      return handleFirestoreError(e, null);
    }
  },

  updateReminder: async (id: string, data: Partial<Reminder>) => {
    try {
      if (!db) return null;
      const ref = doc(db, 'reminders', id);
      return await updateDoc(ref, data);
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  },

  deleteReminder: async (id: string) => {
    try {
      if (!db) return null;
      return await deleteDoc(doc(db, 'reminders', id));
    } catch (e) {
      return handleFirestoreError(e, null);
    }
  }
};

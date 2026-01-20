
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  doc, 
  serverTimestamp, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

// Configuração real fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyBqMiJ-tZhCR8V24QbnKEfAKriXC-ztvJw",
  authDomain: "project-manager-joia.firebaseapp.com",
  projectId: "project-manager-joia",
  storageBucket: "project-manager-joia.firebasestorage.app",
  messagingSenderId: "361390049572",
  appId: "1:361390049572:web:8affd1bd90fca481ba4bb1"
};

let db: any = null;
let messaging: any = null;

try {
  const app = initializeApp(firebaseConfig);
  
  // Configuração de cache persistente para garantir funcionamento offline total
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn("FCM não suportado ou negado neste navegador.");
    }
  }
} catch (e) {
  console.error("Erro crítico ao inicializar o Firebase:", e);
}

export { 
  db, 
  messaging, 
  serverTimestamp, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  addDoc 
};

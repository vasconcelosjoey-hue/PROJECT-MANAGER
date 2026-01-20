
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

// Configuração Demo - Substitua pelos valores reais do seu console Firebase
const firebaseConfig = {
  apiKey: "DEMO_KEY_PLACEHOLDER",
  authDomain: "project-manager-demo.firebaseapp.com",
  projectId: "project-manager-demo",
  storageBucket: "project-manager-demo.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

let db: any = null;
let messaging: any = null;

try {
  const app = initializeApp(firebaseConfig);
  
  // Cache persistente é crucial para o modo PWA funcionar sem internet
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn("FCM não suportado neste navegador.");
    }
  }
} catch (e) {
  console.error("Falha ao inicializar Firebase. O app entrará em modo de visualização offline.");
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

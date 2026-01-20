
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
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

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
  
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
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
  addDoc,
  getToken,
  onMessage
};

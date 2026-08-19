// =============================================
// FIREBASE CONFIGURATION
// Configuración conectada al proyecto Firebase de Yaiki
// =============================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAGq2rCRXPsB9ageGfmyyv4Q8SqLDAM1rQ",
  authDomain: "yaikiapp.firebaseapp.com",
  projectId: "yaikiapp",
  storageBucket: "yaikiapp.firebasestorage.app",
  messagingSenderId: "170363891491",
  appId: "1:170363891491:web:fa862458cf98798267a696",
  measurementId: "G-J0E0KK805F"
};

// Inicializar Firebase (evitar múltiples inicializaciones)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

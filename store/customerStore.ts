// =============================================
// ZUSTAND STORE — Cuenta de la clienta
// Registro, login y perfil en Firestore (customers/{uid})
// =============================================
import { create } from 'zustand';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Customer, ShippingAddress } from '@/types';

interface CustomerState {
  customer: Customer | null;
  address: ShippingAddress | null;
  isLoading: boolean;
  isReady: boolean;           // ya resolvimos la sesión persistida
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  saveAddress: (address: ShippingAddress) => Promise<void>;
  saveWristSize: (wristSize: number) => Promise<void>;
  init: () => () => void;
  clearError: () => void;
}

const friendlyError = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use': return 'Ese correo ya tiene una cuenta.';
    case 'auth/invalid-email': return 'El correo no es válido.';
    case 'auth/weak-password': return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Correo o contraseña incorrectos.';
    case 'auth/network-request-failed': return 'Sin conexión. Revisa tu internet.';
    default: return 'No pudimos completar la acción. Intenta de nuevo.';
  }
};

/** Lee el perfil del cliente; si no existe lo crea */
const loadProfile = async (uid: string, email: string, fallbackName: string) => {
  const snap = await getDoc(doc(db, 'customers', uid));
  if (snap.exists()) {
    const data = snap.data();
    return {
      customer: {
        uid,
        email,
        name: data.name ?? fallbackName,
        phone: data.phone,
        wristSize: data.wristSize,
      } as Customer,
      address: (data.address ?? null) as ShippingAddress | null,
    };
  }
  const customer: Customer = { uid, email, name: fallbackName };
  await setDoc(doc(db, 'customers', uid), { name: fallbackName, email });
  return { customer, address: null };
};

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customer: null,
  address: null,
  isLoading: false,
  isReady: false,
  error: null,

  // Restaura la sesión guardada por Firebase Auth al abrir la app
  init: () => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      // Los admins usan su propio store; aquí solo clientas
      if (!user) {
        set({ customer: null, address: null, isReady: true });
        return;
      }
      const adminSnap = await getDoc(doc(db, 'admins', user.uid)).catch(() => null);
      if (adminSnap?.exists()) {
        set({ customer: null, address: null, isReady: true });
        return;
      }
      try {
        const { customer, address } = await loadProfile(
          user.uid,
          user.email ?? '',
          user.displayName ?? 'Clienta'
        );
        set({ customer, address, isReady: true });
      } catch {
        set({ isReady: true });
      }
    });
    return unsub;
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await setDoc(doc(db, 'customers', cred.user.uid), {
        name: name.trim(),
        email: email.trim(),
      });
      set({
        customer: { uid: cred.user.uid, email: email.trim(), name: name.trim() },
        address: null,
        isLoading: false,
      });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: friendlyError(e?.code ?? '') });
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const { customer, address } = await loadProfile(
        cred.user.uid,
        cred.user.email ?? email.trim(),
        cred.user.displayName ?? 'Clienta'
      );
      set({ customer, address, isLoading: false });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: friendlyError(e?.code ?? '') });
      return false;
    }
  },

  logout: async () => {
    await signOut(auth).catch(() => {});
    set({ customer: null, address: null });
  },

  saveAddress: async (address) => {
    const { customer } = get();
    if (!customer) return;
    await setDoc(doc(db, 'customers', customer.uid), { address }, { merge: true });
    set({ address });
  },

  saveWristSize: async (wristSize) => {
    const { customer } = get();
    if (!customer) return;
    await setDoc(doc(db, 'customers', customer.uid), { wristSize }, { merge: true });
    set({ customer: { ...customer, wristSize } });
  },

  clearError: () => set({ error: null }),
}));

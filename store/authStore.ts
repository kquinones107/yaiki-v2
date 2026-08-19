// =============================================
// ZUSTAND STORE — Autenticación Admin
// Con SecureStore para persistencia segura
// =============================================
import { create } from 'zustand';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { auth, db } from '@/config/firebase';
import { AdminUser } from '@/types';

interface AuthState {
  admin: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

const ADMIN_TOKEN_KEY = 'yaiki_admin_token';
const ADMIN_EMAIL_KEY = 'yaiki_admin_email';

export const useAuthStore = create<AuthState>((set, get) => ({
  admin: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar que es admin en Firestore
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!adminDoc.exists()) {
        await signOut(auth);
        set({ isLoading: false, error: 'Acceso no autorizado.' });
        return false;
      }

      const adminUser: AdminUser = {
        uid: user.uid,
        email: user.email || '',
        isAdmin: true,
      };

      // Guardar sesión segura
      const token = await user.getIdToken();
      await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, token);
      await SecureStore.setItemAsync(ADMIN_EMAIL_KEY, email);

      set({ admin: adminUser, isLoading: false, error: null });
      return true;
    } catch (error: any) {
      const msg =
        error.code === 'auth/invalid-credential'
          ? 'Credenciales incorrectas.'
          : 'Error al iniciar sesión. Intenta nuevamente.';
      set({ isLoading: false, error: msg });
      return false;
    }
  },

  logout: async () => {
    await signOut(auth);
    await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY);
    await SecureStore.deleteItemAsync(ADMIN_EMAIL_KEY);
    set({ admin: null, error: null });
  },

  checkSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
      const currentUser = auth.currentUser;
      if (token && currentUser) {
        set({
          admin: {
            uid: currentUser.uid,
            email: currentUser.email || '',
            isAdmin: true,
          },
        });
      }
    } catch {
      set({ admin: null });
    }
  },

  clearError: () => set({ error: null }),
}));

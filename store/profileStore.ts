// =============================================
// ZUSTAND STORE — Datos de la clienta (sin cuenta)
// Todo vive en el dispositivo: no hay registro ni
// contraseñas. Solo los datos necesarios para enviar
// el pedido, más favoritos y diseños guardados.
// =============================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { BraceletDesign, Product, ShippingAddress } from '@/types';

const newDeviceId = () =>
  `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;

export const emptyProfile: ShippingAddress = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  notes: '',
};

/** Con estos cuatro datos ya se puede despachar un pedido */
export const isProfileComplete = (p: ShippingAddress): boolean =>
  p.fullName.trim().length >= 3 &&
  p.phone.replace(/\D/g, '').length >= 7 &&
  p.address.trim().length >= 6 &&
  p.city.trim().length >= 3;

interface ProfileState {
  /** Identifica a esta clienta en sus pedidos, sin pedirle cuenta */
  deviceId: string;
  /**
   * uid anónimo de Firebase. La clienta nunca se registra: la app
   * abre una sesión anónima para poder guardar su pedido con las
   * reglas de Firestore puestas (orders.customerId == auth.uid).
   */
  uid: string | null;
  profile: ShippingAddress;
  wristSize: number | null;
  favorites: Product[];
  designs: BraceletDesign[];

  initAuth: () => () => void;
  saveProfile: (profile: ShippingAddress) => void;
  saveWristSize: (wristSize: number) => void;
  toggleFavorite: (product: Product) => boolean;
  isFavorite: (productId: string) => boolean;
  addDesign: (design: BraceletDesign) => void;
  removeDesign: (designId: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      deviceId: newDeviceId(),
      uid: null,
      profile: emptyProfile,
      wristSize: null,
      favorites: [],
      designs: [],

      // Sesión anónima silenciosa: ni registro ni contraseña
      initAuth: () => {
        const unsub = onAuthStateChanged(auth, (user) => {
          if (user) {
            set({ uid: user.uid });
            return;
          }
          set({ uid: null });
          signInAnonymously(auth).catch(() => {});
        });
        return unsub;
      },

      saveProfile: (profile) => set({ profile }),

      saveWristSize: (wristSize) => set({ wristSize }),

      // Devuelve true si quedó guardado, false si se quitó
      toggleFavorite: (product) => {
        const exists = get().favorites.some((f) => f.id === product.id);
        set((state) => ({
          favorites: exists
            ? state.favorites.filter((f) => f.id !== product.id)
            : [product, ...state.favorites],
        }));
        return !exists;
      },

      isFavorite: (productId) => get().favorites.some((f) => f.id === productId),

      addDesign: (design) =>
        set((state) => ({ designs: [design, ...state.designs] })),

      removeDesign: (designId) =>
        set((state) => ({ designs: state.designs.filter((d) => d.id !== designId) })),
    }),
    {
      name: 'yaiki-profile-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // El uid lo resuelve Firebase en cada arranque
      partialize: ({ uid, initAuth, saveProfile, saveWristSize, toggleFavorite,
        isFavorite, addDesign, removeDesign, ...rest }) => rest as ProfileState,
    }
  )
);

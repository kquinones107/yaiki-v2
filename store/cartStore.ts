// =============================================
// ZUSTAND STORE — Carrito de compras
// Soporta productos del catálogo y pulseras personalizadas
// Persistencia con AsyncStorage
// =============================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BraceletDesign, CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  addCustomDesign: (design: BraceletDesign) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          // Un producto del catálogo se agrupa por su propio id
          const existing = state.items.findIndex((i) => i.product?.id === product.id);
          if (existing >= 0) {
            const updated = [...state.items];
            updated[existing] = {
              ...updated[existing],
              quantity: updated[existing].quantity + 1,
            };
            return { items: updated };
          }
          const line: CartItem = {
            id: `p_${product.id}`,
            name: product.name,
            unitPrice: product.price,
            quantity: 1,
            image: product.images[0],
            product,
          };
          return { items: [...state.items, line] };
        });
      },

      // Cada diseño es único: siempre entra como una línea nueva
      addCustomDesign: (design: BraceletDesign) => {
        set((state) => {
          const line: CartItem = {
            id: `d_${design.id}`,
            name: design.name,
            unitPrice: design.totalPrice,
            quantity: 1,
            design,
          };
          return { items: [...state.items, line] };
        });
      },

      removeItem: (lineId: string) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== lineId) }));
      },

      updateQuantity: (lineId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === lineId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    {
      name: 'yaiki-cart-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

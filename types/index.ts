// =============================================
// TYPES — Tipos globales de TypeScript
// =============================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];          // URLs de Firebase Storage
  categoryId: string;
  categoryName: string;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  tags: string[];
  whatsappNote?: string;     // Nota especial para WhatsApp
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

// Navegación
export type RootStackParamList = {
  '(tabs)': undefined;
  'product/[id]': { id: string };
  'admin-login': undefined;
  'admin/index': undefined;
  'admin/products/index': undefined;
  'admin/products/nuevo': undefined;
  'admin/products/[id]': { id: string };
  'admin/categorias': undefined;
};

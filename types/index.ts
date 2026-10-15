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

// ---- DISEÑADOR DE PULSERAS ----

export type BeadKind = 'piedra' | 'mostacilla' | 'letra' | 'charm' | 'separador';

/** Pieza del catálogo con la que se arma una pulsera */
export interface Bead {
  id: string;
  kind: BeadKind;
  label: string;
  color: string;        // color de relleno
  size: number;         // diámetro visual en px (≈ mm reales)
  price: number;        // precio unitario COP
  symbol?: string;      // glifo mostrado dentro de la pieza (charms)
}

/** Una pieza ya colocada en el diseño */
export interface DesignBead {
  /** id único de la posición dentro del diseño */
  slotId: string;
  beadId: string;
  /** solo para kind === 'letra' */
  letter?: string;
}

export interface BraceletDesign {
  id: string;
  name: string;
  beads: DesignBead[];
  /** largo del cordón en cm elegido por la clienta */
  wristSize: number;
  basePrice: number;    // cordón + armado
  totalPrice: number;
  createdAt?: Date | string;
}

// ---- CARRITO ----

/**
 * Una línea del carrito. Puede ser un producto del catálogo
 * o una pulsera personalizada creada en el diseñador.
 */
export interface CartItem {
  /** id de la línea (no del producto) */
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  product?: Product;
  design?: BraceletDesign;
}

// ---- CLIENTES Y PEDIDOS ----

export interface Customer {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  wristSize?: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

/**
 * Único método de pago: contra entrega.
 * La app NO procesa ni recibe pagos: la clienta paga al recibir el pedido.
 */
export type PaymentMethod = 'contraentrega';

export const PAYMENT_NOTICE =
  'Pago contra entrega. La app no recibe pagos ni datos de tarjetas: pagas en efectivo cuando recibas tu pedido.';

export type OrderStatus = 'recibido' | 'preparacion' | 'enviado' | 'entregado' | 'cancelado';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'recibido',
  'preparacion',
  'enviado',
  'entregado',
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  recibido: 'Pedido recibido',
  preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export interface OrderLine {
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  /** descripción legible del diseño personalizado, si aplica */
  designSummary?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  lines: OrderLine[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  trackingCode?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

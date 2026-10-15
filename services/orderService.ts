// =============================================
// SERVICIO — Pedidos (checkout dentro de la app)
// =============================================
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  CartItem, Order, OrderLine, OrderStatus, PaymentMethod, ShippingAddress,
} from '@/types';
import { designSummary } from '@/services/designService';

/** Envío gratis a partir de este subtotal */
export const FREE_SHIPPING_FROM = 120000;
export const SHIPPING_COST = 12000;

export const shippingCostFor = (subtotal: number): number =>
  subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;

/** YK-240115-4821 */
const buildOrderNumber = (): string => {
  const now = new Date();
  const ymd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `YK-${ymd}-${rand}`;
};

export const cartToLines = (items: CartItem[]): OrderLine[] =>
  items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    ...(item.image ? { image: item.image } : {}),
    ...(item.design ? { designSummary: designSummary(item.design) } : {}),
  }));

export const createOrder = async (params: {
  customerId: string;
  customerEmail: string;
  items: CartItem[];
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
}): Promise<{ id: string; orderNumber: string }> => {
  const lines = cartToLines(params.items);
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const shippingCost = shippingCostFor(subtotal);
  const orderNumber = buildOrderNumber();

  const docRef = await addDoc(collection(db, 'orders'), {
    orderNumber,
    customerId: params.customerId,
    customerEmail: params.customerEmail,
    lines,
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    shipping: params.shipping,
    paymentMethod: params.paymentMethod,
    status: 'recibido' as OrderStatus,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return { id: docRef.id, orderNumber };
};

const mapOrder = (id: string, data: any): Order => ({
  id,
  ...data,
  createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
  updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
} as Order);

export const getMyOrders = async (customerId: string): Promise<Order[]> => {
  const snap = await getDocs(query(
    collection(db, 'orders'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  ));
  return snap.docs.map((d) => mapOrder(d.id, d.data()));
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return mapOrder(snap.id, snap.data());
};

// ---- ADMIN ----

export const getAllOrders = async (): Promise<Order[]> => {
  const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => mapOrder(d.id, d.data()));
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
  trackingCode?: string
) => {
  await updateDoc(doc(db, 'orders', id), {
    status,
    ...(trackingCode !== undefined ? { trackingCode } : {}),
    updatedAt: Timestamp.now(),
  });
};

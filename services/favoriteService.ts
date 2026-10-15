// =============================================
// SERVICIO — Favoritos del cliente
// customers/{uid}/favorites/{productId}
// =============================================
import { collection, doc, getDocs, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Product } from '@/types';

const favRef = (uid: string) => collection(db, 'customers', uid, 'favorites');

export const getFavorites = async (uid: string): Promise<Product[]> => {
  const snap = await getDocs(favRef(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
};

export const addFavorite = async (uid: string, product: Product) => {
  const { id, ...rest } = product;
  await setDoc(doc(db, 'customers', uid, 'favorites', id), {
    ...rest,
    createdAt: Timestamp.now(),
  });
};

export const removeFavorite = async (uid: string, productId: string) => {
  await deleteDoc(doc(db, 'customers', uid, 'favorites', productId));
};

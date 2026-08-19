// =============================================
// FIREBASE SERVICES — Productos
// CRUD completo con Firestore + Storage
// =============================================
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Product, Category } from '@/types';

// ---- CATEGORÍAS ----

export const getCategories = async (): Promise<Category[]> => {
  const q = query(
    collection(db, 'categories'),
    where('isActive', '==', true),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
};

export const getAllCategories = async (): Promise<Category[]> => {
  const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  await updateDoc(doc(db, 'categories', id), data);
};

export const createCategory = async (data: Omit<Category, 'id'>) => {
  const docRef = await addDoc(collection(db, 'categories'), data);
  return docRef.id;
};

// ---- PRODUCTOS ----

export const getProducts = async (categoryId?: string): Promise<Product[]> => {
  let q;
  if (categoryId) {
    q = query(
      collection(db, 'products'),
      where('categoryId', '==', categoryId),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, 'products'),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc')
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
    updatedAt: d.data().updatedAt?.toDate?.() || d.data().updatedAt,
  } as Product));
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const q = query(
    collection(db, 'products'),
    where('isFeatured', '==', true),
    where('isAvailable', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
};

export const getAllProductsAdmin = async (): Promise<Product[]> => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
    updatedAt: d.data().updatedAt?.toDate?.() || d.data().updatedAt,
  } as Product));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
};

export const createProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteProduct = async (id: string, imageUrls: string[]) => {
  // Eliminar imágenes de Storage
  for (const url of imageUrls) {
    try {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    } catch {}
  }
  await deleteDoc(doc(db, 'products', id));
};

// ---- SUBIR IMAGEN ----

export const uploadProductImage = async (
  uri: string,
  productId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filename = `products/${productId}/${Date.now()}.jpg`;
  const imageRef = ref(storage, filename);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(imageRef, blob);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      reject,
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

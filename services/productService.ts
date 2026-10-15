// =============================================
// FIREBASE SERVICES — Productos
// CRUD completo con Firestore + Storage
// =============================================
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, setDoc,
  deleteDoc, query, where, orderBy, Timestamp,
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Product, Category } from '@/types';
import { seedCategories, seedProducts, SEED_CATEGORIES, SEED_PRODUCTS } from '@/constants/seedCatalog';

/**
 * La tienda nunca se muestra vacía: si Firestore todavía no tiene
 * contenido (o falla la consulta), servimos el catálogo base incluido
 * en la app. En cuanto el panel admin carga productos reales, estos
 * reemplazan al catálogo base automáticamente.
 */
const orSeed = <T,>(rows: T[], fallback: () => T[]): T[] =>
  rows.length > 0 ? rows : fallback();

// ---- CATEGORÍAS ----

export const getCategories = async (): Promise<Category[]> => {
  try {
    const q = query(
      collection(db, 'categories'),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const snap = await getDocs(q);
    return orSeed(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)),
      seedCategories
    );
  } catch {
    return seedCategories();
  }
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
  try {
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt,
      updatedAt: d.data().updatedAt?.toDate?.() || d.data().updatedAt,
    } as Product));
    return orSeed(rows, () =>
      categoryId
        ? seedProducts().filter((p) => p.categoryId === categoryId)
        : seedProducts()
    );
  } catch {
    return categoryId
      ? seedProducts().filter((p) => p.categoryId === categoryId)
      : seedProducts();
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const seedFeatured = () => seedProducts().filter((p) => p.isFeatured);
  try {
    const q = query(
      collection(db, 'products'),
      where('isFeatured', '==', true),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return orSeed(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)),
      seedFeatured
    );
  } catch {
    return seedFeatured();
  }
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
  // Los ids que empiezan por "seed-" vienen del catálogo base local
  const fromSeed = () => seedProducts().find((p) => p.id === id) ?? null;
  if (id.startsWith('seed-')) return fromSeed();
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (!snap.exists()) return fromSeed();
    return { id: snap.id, ...snap.data() } as Product;
  } catch {
    return fromSeed();
  }
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

// ---- CARGA DEL CATÁLOGO BASE (admin) ----

/**
 * Copia el catálogo base a Firestore para que Yaiki lo edite
 * desde el panel (precios, fotos, stock). Conserva los ids
 * "seed-*" para no duplicar si se vuelve a ejecutar.
 */
export const seedFirestoreCatalog = async (): Promise<{ categories: number; products: number }> => {
  let categories = 0;
  let products = 0;

  for (const category of SEED_CATEGORIES) {
    const { id, ...rest } = category;
    await setDoc(doc(db, 'categories', id), rest, { merge: true });
    categories += 1;
  }

  for (const product of SEED_PRODUCTS) {
    const { id, ...rest } = product;
    await setDoc(
      doc(db, 'products', id),
      { ...rest, createdAt: Timestamp.now(), updatedAt: Timestamp.now() },
      { merge: true }
    );
    products += 1;
  }

  return { categories, products };
};

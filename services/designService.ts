// =============================================
// SERVICIO — Diseños personalizados de pulseras
// Cálculo de precio y persistencia en Firestore
// =============================================
import {
  collection, doc, addDoc, getDocs, deleteDoc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { BraceletDesign, DesignBead } from '@/types';
import { BRACELET_BASE_PRICE, MAX_BEADS_PER_CM, findBead } from '@/constants/beads';

/** Suma del cordón + cada pieza colocada */
export const calcDesignPrice = (beads: DesignBead[]): number =>
  beads.reduce((sum, b) => sum + (findBead(b.beadId)?.price ?? 0), BRACELET_BASE_PRICE);

/** Cuántas piezas caben en una muñeca de N cm */
export const maxBeadsForWrist = (wristSize: number): number =>
  Math.floor(wristSize * MAX_BEADS_PER_CM);

/** Texto legible del diseño, para el pedido y el panel admin */
export const designSummary = (design: BraceletDesign): string => {
  const parts = design.beads.map((b) => {
    const bead = findBead(b.beadId);
    if (!bead) return '?';
    return bead.kind === 'letra' ? `[${b.letter ?? '?'}]` : bead.label;
  });
  return `${design.wristSize} cm · ${design.beads.length} piezas · ${parts.join(' + ')}`;
};

// ---- PERSISTENCIA (subcolección del cliente) ----

const designsRef = (uid: string) => collection(db, 'customers', uid, 'designs');

export const saveDesign = async (
  uid: string,
  design: Omit<BraceletDesign, 'id' | 'createdAt'>
): Promise<string> => {
  const docRef = await addDoc(designsRef(uid), {
    ...design,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

export const getMyDesigns = async (uid: string): Promise<BraceletDesign[]> => {
  const snap = await getDocs(query(designsRef(uid), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() ?? d.data().createdAt,
  } as BraceletDesign));
};

export const deleteDesign = async (uid: string, designId: string) => {
  await deleteDoc(doc(db, 'customers', uid, 'designs', designId));
};

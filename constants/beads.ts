// =============================================
// CATÁLOGO DE PIEZAS — Diseñador de pulseras
// Precios en COP por pieza
// =============================================
import { Bead } from '@/types';

/** Precio del cordón + armado a mano de cualquier pulsera */
export const BRACELET_BASE_PRICE = 8000;

/** Tallas de muñeca disponibles (cm) */
export const WRIST_SIZES = [14, 15, 16, 17, 18, 19, 20];

/** Largo aproximado que ocupa cada mm de pieza, usado para el aviso de largo */
export const MAX_BEADS_PER_CM = 1.6;

export const BEADS: Bead[] = [
  // --- PIEDRAS ---
  { id: 'p-cuarzo-rosa', kind: 'piedra', label: 'Cuarzo rosa', color: '#F4A7B9', size: 26, price: 3500 },
  { id: 'p-amatista', kind: 'piedra', label: 'Amatista', color: '#9B6DD6', size: 26, price: 3800 },
  { id: 'p-turquesa', kind: 'piedra', label: 'Turquesa', color: '#45B8AC', size: 26, price: 3600 },
  { id: 'p-onix', kind: 'piedra', label: 'Ónix negro', color: '#2B2B2B', size: 26, price: 3200 },
  { id: 'p-jade', kind: 'piedra', label: 'Jade verde', color: '#5FA777', size: 26, price: 3700 },
  { id: 'p-cristal', kind: 'piedra', label: 'Cristal', color: '#DDE8F0', size: 26, price: 3000 },

  // --- MOSTACILLA ---
  { id: 'm-dorada', kind: 'mostacilla', label: 'Dorada', color: '#D4AF37', size: 16, price: 900 },
  { id: 'm-plateada', kind: 'mostacilla', label: 'Plateada', color: '#C8CDD4', size: 16, price: 900 },
  { id: 'm-coral', kind: 'mostacilla', label: 'Coral', color: '#FF7F6B', size: 16, price: 800 },
  { id: 'm-marfil', kind: 'mostacilla', label: 'Marfil', color: '#F3EADA', size: 16, price: 800 },
  { id: 'm-azul', kind: 'mostacilla', label: 'Azul mar', color: '#4A7FB5', size: 16, price: 800 },
  { id: 'm-lila', kind: 'mostacilla', label: 'Lila', color: '#C3A6E0', size: 16, price: 800 },

  // --- LETRAS ---
  { id: 'l-blanca', kind: 'letra', label: 'Letra blanca', color: '#FFFFFF', size: 24, price: 1500 },
  { id: 'l-dorada', kind: 'letra', label: 'Letra dorada', color: '#E8C76A', size: 24, price: 1800 },

  // --- CHARMS ---
  { id: 'c-corazon', symbol: '♥', kind: 'charm', label: 'Corazón ♥', color: '#E8738F', size: 28, price: 4500 },
  { id: 'c-estrella', symbol: '★', kind: 'charm', label: 'Estrella ★', color: '#E8C76A', size: 28, price: 4500 },
  { id: 'c-luna', symbol: '☾', kind: 'charm', label: 'Luna ☾', color: '#CBD5E1', size: 28, price: 4500 },
  { id: 'c-concha', symbol: '✺', kind: 'charm', label: 'Concha ✺', color: '#F0D9C0', size: 28, price: 4800 },
  { id: 'c-mal-de-ojo', symbol: '◉', kind: 'charm', label: 'Ojo turco', color: '#3B82F6', size: 28, price: 5000 },

  // --- SEPARADORES ---
  { id: 's-dorado', kind: 'separador', label: 'Separador oro', color: '#D4AF37', size: 10, price: 500 },
  { id: 's-plata', kind: 'separador', label: 'Separador plata', color: '#C8CDD4', size: 10, price: 500 },
];

export const BEAD_KIND_LABEL: Record<Bead['kind'], string> = {
  piedra: 'Piedras',
  mostacilla: 'Mostacilla',
  letra: 'Letras',
  charm: 'Charms',
  separador: 'Separadores',
};

export const BEAD_KINDS: Bead['kind'][] = ['piedra', 'mostacilla', 'letra', 'charm', 'separador'];

export const findBead = (id: string): Bead | undefined => BEADS.find((b) => b.id === id);

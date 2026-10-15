// =============================================
// CATÁLOGO BASE — Contenido inicial de la tienda
// Se muestra cuando Firestore todavía está vacío y
// puede cargarse al panel admin para editarlo allí.
// Las fotos son de la galería de la app: Yaiki las
// reemplaza por las reales desde el panel.
// =============================================
import { Category, Product } from '@/types';

type SeedCategory = Omit<Category, 'id'> & { id: string };
type SeedProduct = Omit<Product, 'createdAt' | 'updatedAt'> & { id: string };

export const SEED_CATEGORIES: SeedCategory[] = [
  { id: 'seed-pulseras', name: 'Pulseras', emoji: '📿', isActive: true, order: 1 },
  { id: 'seed-anillos', name: 'Anillos', emoji: '💍', isActive: true, order: 2 },
  { id: 'seed-collares', name: 'Collares', emoji: '✨', isActive: true, order: 3 },
  { id: 'seed-aretes', name: 'Aretes', emoji: '🌸', isActive: true, order: 4 },
  { id: 'seed-playa', name: 'Playa', emoji: '🐚', isActive: true, order: 5 },
  { id: 'seed-personalizados', name: 'Personalizados', emoji: '🔤', isActive: true, order: 6 },
];

/** Imagen local por categoría mientras no haya fotos en Storage */
export const SEED_IMAGE_BY_CATEGORY: Record<string, any> = {
  'seed-pulseras': require('@/assets/images/hero-pulseras.jpg'),
  'seed-anillos': require('@/assets/images/hero-anillos.jpg'),
  'seed-collares': require('@/assets/images/hero-personalizadas.jpg'),
  'seed-aretes': require('@/assets/images/hero-personalizadas.jpg'),
  'seed-playa': require('@/assets/images/hero-pulseras.jpg'),
  'seed-personalizados': require('@/assets/images/hero-personalizadas.jpg'),
};

export const SEED_FALLBACK_IMAGE = require('@/assets/images/hero-pulseras.jpg');

const p = (
  id: string,
  categoryId: string,
  name: string,
  price: number,
  description: string,
  tags: string[],
  extra: Partial<SeedProduct> = {}
): SeedProduct => ({
  id,
  name,
  description,
  price,
  images: [],
  categoryId,
  categoryName: SEED_CATEGORIES.find((c) => c.id === categoryId)!.name,
  stock: 8,
  isAvailable: true,
  isFeatured: false,
  tags,
  ...extra,
});

export const SEED_PRODUCTS: SeedProduct[] = [
  // --- PULSERAS ---
  p('seed-pul-01', 'seed-pulseras', 'Pulsera Cuarzo Rosa', 32000,
    'Pulsera tejida a mano con piedras de cuarzo rosa de 8 mm y cierre ajustable. El cuarzo rosa se asocia al amor propio y la calma, y su tono suave combina con todo. Cada pieza se arma una por una, así que los vetados de la piedra son únicos.',
    ['cuarzo', 'rosa', 'piedras', 'ajustable'], { isFeatured: true, stock: 12 }),
  p('seed-pul-02', 'seed-pulseras', 'Pulsera Mostacilla Dorada', 24000,
    'Pulsera de mostacilla checa en tono dorado, tejida en punto cerrado sobre hilo encerado resistente al agua. Liviana, ideal para usar en capas con otras pulseras del mismo tono.',
    ['mostacilla', 'dorada', 'tejida'], { isFeatured: true, stock: 15 }),
  p('seed-pul-03', 'seed-pulseras', 'Pulsera Ónix Negro', 35000,
    'Piedras de ónix negro mate de 8 mm con separadores dorados. Un básico elegante que va igual de bien con jean que con vestido. Cierre elástico de alta resistencia.',
    ['onix', 'negro', 'unisex', 'piedras'], { stock: 10 }),
  p('seed-pul-04', 'seed-pulseras', 'Set Trío Pastel', 45000,
    'Tres pulseras pensadas para usarse juntas: una de mostacilla marfil, una de cuarzo rosa y una de cristal facetado. También funcionan por separado o repartidas entre amigas.',
    ['set', 'pastel', 'regalo', 'trio'], { isFeatured: true, stock: 6 }),

  // --- ANILLOS ---
  p('seed-ani-01', 'seed-anillos', 'Anillo Mostacilla Multicolor', 16000,
    'Anillo tejido en mostacilla japonesa con patrón de flor en colores vivos. Tejido sobre hilo elástico, se adapta con comodidad al dedo.',
    ['anillo', 'multicolor', 'flor', 'tejido'], { stock: 20 }),
  p('seed-ani-02', 'seed-anillos', 'Anillo Perla Diminuta', 19000,
    'Anillo delicado de mostacilla marfil con una perla de río al centro. Sutil y discreto, perfecto para usar en varios dedos a la vez.',
    ['anillo', 'perla', 'delicado'], { isFeatured: true, stock: 14 }),
  p('seed-ani-03', 'seed-anillos', 'Set Anillos Dorados x3', 28000,
    'Tres anillos finos en mostacilla dorada de distinto grosor, diseñados para apilarse. Un set que levanta cualquier mano sin pesar nada.',
    ['set', 'dorado', 'apilable'], { stock: 9 }),

  // --- COLLARES ---
  p('seed-col-01', 'seed-collares', 'Collar Gargantilla Dorada', 42000,
    'Gargantilla tejida en mostacilla dorada con largo ajustable de 36 a 42 cm. El cierre y los apliques son de acero quirúrgico, así que no se oscurece con el uso.',
    ['collar', 'gargantilla', 'dorado', 'acero'], { isFeatured: true, stock: 8 }),
  p('seed-col-02', 'seed-collares', 'Collar Dije Luna', 48000,
    'Cadena fina de acero quirúrgico con dije de luna en baño dorado. Un collar para todos los días que no se quita ni en la ducha.',
    ['collar', 'luna', 'dije', 'acero'], { stock: 7 }),
  p('seed-col-03', 'seed-collares', 'Collar Piedras de Jade', 55000,
    'Collar de piedras de jade verde con separadores dorados, montado sobre hilo de seda con nudos entre piedra y piedra, como se hace tradicionalmente.',
    ['collar', 'jade', 'piedras', 'verde'], { stock: 5 }),

  // --- ARETES ---
  p('seed-are-01', 'seed-aretes', 'Aretes Flor de Mostacilla', 22000,
    'Aretes tejidos en forma de flor con mostacilla japonesa, sobre base de acero quirúrgico hipoalergénico. Livianos: se sienten cómodos todo el día.',
    ['aretes', 'flor', 'hipoalergenico'], { isFeatured: true, stock: 16 }),
  p('seed-are-02', 'seed-aretes', 'Aretes Argolla Trenzada', 26000,
    'Argollas de 3 cm forradas en mostacilla dorada con tejido trenzado. Hacen presencia sin pesar en la oreja.',
    ['aretes', 'argolla', 'dorado'], { stock: 11 }),
  p('seed-are-03', 'seed-aretes', 'Aretes Perla Mini', 20000,
    'Topos de perla de río montados en acero quirúrgico. El par más versátil del catálogo: oficina, universidad o fiesta.',
    ['aretes', 'perla', 'topos', 'clasico'], { stock: 18 }),

  // --- PLAYA ---
  p('seed-pla-01', 'seed-playa', 'Tobillera Conchas', 28000,
    'Tobillera en hilo encerado con conchas naturales recogidas y limpiadas a mano. Resiste el agua salada y el sol sin decolorarse.',
    ['tobillera', 'conchas', 'playa', 'verano'], { isFeatured: true, stock: 13 }),
  p('seed-pla-02', 'seed-playa', 'Pulsera Ojo Turco', 25000,
    'Pulsera tejida con dije de ojo turco en azul, el amuleto de protección de siempre. Hilo resistente al agua, pensada para no quitársela en vacaciones.',
    ['pulsera', 'ojo turco', 'proteccion', 'playa'], { stock: 17 }),
  p('seed-pla-03', 'seed-playa', 'Set Playero Conchas', 52000,
    'Tobillera, pulsera y anillo en la misma paleta de arena y turquesa con detalles en concha. El set completo para la temporada de playa.',
    ['set', 'playa', 'conchas', 'turquesa'], { stock: 6 }),

  // --- PERSONALIZADOS ---
  p('seed-per-01', 'seed-personalizados', 'Pulsera con Nombre', 30000,
    'Pulsera tejida con letras de tu nombre o la palabra que quieras, hasta 12 caracteres. Eliges el color del hilo y el tono de las letras. ¿Quieres armarla pieza por pieza y ver el precio en vivo? Usa la pestaña Crear de la app.',
    ['nombre', 'personalizada', 'letras', 'regalo'], { isFeatured: true, stock: 25 }),
  p('seed-per-02', 'seed-personalizados', 'Pulseras de Pareja', 54000,
    'Dos pulseras a juego con los nombres o iniciales de cada quien. Para parejas, mejores amigas o mamá e hija.',
    ['pareja', 'personalizada', 'duo', 'regalo'], { stock: 10 }),
  p('seed-per-03', 'seed-personalizados', 'Pulsera Frase Favorita', 34000,
    'Tu frase o mantra tejido en letras sobre la base de color que elijas. Hasta 12 caracteres, armada a mano en 2 a 3 días.',
    ['frase', 'personalizada', 'mantra'], { stock: 12 }),
];

/** Productos base como Product completo (con fechas) */
export const seedProducts = (): Product[] =>
  SEED_PRODUCTS.map((s) => ({
    ...s,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }));

export const seedCategories = (): Category[] => SEED_CATEGORIES.map((c) => ({ ...c }));

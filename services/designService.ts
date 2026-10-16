// =============================================
// SERVICIO — Diseños personalizados de pulseras
// Precio, largo y resumen legible. Los diseños
// guardados viven en el teléfono (profileStore).
// =============================================
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

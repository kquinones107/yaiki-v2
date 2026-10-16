// =============================================
// BRACELET PREVIEW — Vista del diseño sobre el cordón
// Reutilizado en el diseñador, el carrito y los pedidos
// =============================================
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { findBead } from '@/constants/beads';
import { DesignBead } from '@/types';

export function BeadView({
  beadId, letter, scale = 1,
}: { beadId: string; letter?: string; scale?: number }) {
  const bead = findBead(beadId);
  if (!bead) return null;
  const size = bead.size * scale;
  const isLight = ['#FFFFFF', '#F3EADA', '#DDE8F0', '#CBD5E1', '#F0D9C0', '#C8CDD4'].includes(bead.color);
  const glyph = bead.kind === 'letra' ? (letter ?? '?') : bead.symbol;

  return (
    <View
      style={[
        styles.bead,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bead.color,
        },
      ]}
    >
      {!!glyph && (
        <Text
          style={[
            styles.beadGlyph,
            { fontSize: size * 0.5, color: isLight ? '#2B2B2B' : Colors.white },
          ]}
        >
          {glyph}
        </Text>
      )}
    </View>
  );
}

export default function BraceletPreview({
  beads, onRemoveAt, scale = 1,
}: {
  beads: DesignBead[];
  onRemoveAt?: (slotId: string) => void;
  scale?: number;
}) {
  if (beads.length === 0) {
    return (
      <View style={styles.cordWrap}>
        <View style={styles.cordTrack}>
          <View style={styles.cord} />
        </View>
        <Text style={styles.emptyHint}>
          Toca una pieza abajo para empezar a armar tu pulsera ✨
        </Text>
      </View>
    );
  }

  // El cordón va detrás y centrado con las piezas, no con toda la tarjeta
  const trackHeight = 34 * scale + 16;

  return (
    <View style={styles.cordWrap}>
      <View style={[styles.cordTrack, { minHeight: trackHeight }]}>
        <View style={styles.cord} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.beadRow}
        >
          {beads.map((b) => (
            <TouchableOpacity
              key={b.slotId}
              disabled={!onRemoveAt}
              onPress={() => onRemoveAt?.(b.slotId)}
              activeOpacity={0.6}
            >
              <BeadView beadId={b.beadId} letter={b.letter} scale={scale} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {!!onRemoveAt && (
        <Text style={styles.removeHint}>Toca una pieza del cordón para quitarla</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cordWrap: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
  },
  cordTrack: {
    justifyContent: 'center',
    minHeight: 44,
  },
  cord: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 3,
    marginTop: -1.5,
    backgroundColor: '#5A4A2A',
  },
  beadRow: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 2,
  },
  bead: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  beadGlyph: { fontWeight: '800' },
  emptyHint: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  removeHint: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});

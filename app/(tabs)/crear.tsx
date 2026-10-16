// =============================================
// CREAR — Diseñador de pulseras personalizadas
// Arma la pulsera pieza por pieza, con precio en vivo
// =============================================
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import BraceletPreview from '@/components/BraceletPreview';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  BEADS, BEAD_KINDS, BEAD_KIND_LABEL, BRACELET_BASE_PRICE, WRIST_SIZES, findBead,
} from '@/constants/beads';
import { calcDesignPrice, maxBeadsForWrist } from '@/services/designService';
import { useCartStore } from '@/store/cartStore';
import { useProfileStore } from '@/store/profileStore';
import { Bead, BraceletDesign, DesignBead } from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

export default function CrearScreen() {
  const addCustomDesign = useCartStore((s) => s.addCustomDesign);
  const { wristSize: savedWristSize, saveWristSize, addDesign } = useProfileStore();

  const [beads, setBeads] = useState<DesignBead[]>([]);
  const [wristSize, setWristSize] = useState<number>(savedWristSize ?? 16);
  const [kind, setKind] = useState<Bead['kind']>('piedra');
  const [letterBeadId, setLetterBeadId] = useState<string>('l-dorada');
  const [letterText, setLetterText] = useState('');
  const [designName, setDesignName] = useState('');

  const palette = useMemo(() => BEADS.filter((b) => b.kind === kind), [kind]);
  const totalPrice = useMemo(() => calcDesignPrice(beads), [beads]);
  const maxBeads = maxBeadsForWrist(wristSize);
  const remaining = maxBeads - beads.length;
  const isFull = remaining <= 0;

  const addBead = (bead: Bead, letter?: string) => {
    if (isFull) {
      Toast.show({
        type: 'error',
        text1: 'Pulsera completa',
        text2: `Para ${wristSize} cm caben ${maxBeads} piezas. Elige una talla mayor.`,
      });
      return;
    }
    setBeads((prev) => [
      ...prev,
      {
        slotId: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        beadId: bead.id,
        ...(letter ? { letter } : {}),
      },
    ]);
  };

  const addLetters = () => {
    const clean = letterText.trim().toUpperCase().replace(/[^A-ZÑ0-9 ]/g, '');
    if (!clean) return;
    const bead = findBead(letterBeadId);
    if (!bead) return;
    const chars = clean.replace(/ /g, '').split('');
    if (chars.length > remaining) {
      Toast.show({
        type: 'error',
        text1: 'No alcanza el espacio',
        text2: `Solo caben ${remaining} piezas más en ${wristSize} cm.`,
      });
      return;
    }
    setBeads((prev) => [
      ...prev,
      ...chars.map((c, i) => ({
        slotId: `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
        beadId: bead.id,
        letter: c,
      })),
    ]);
    setLetterText('');
  };

  const removeAt = (slotId: string) =>
    setBeads((prev) => prev.filter((b) => b.slotId !== slotId));

  const undo = () => setBeads((prev) => prev.slice(0, -1));

  const clearAll = () => {
    if (beads.length === 0) return;
    Alert.alert('Empezar de nuevo', '¿Quitar todas las piezas del cordón?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar todo', style: 'destructive', onPress: () => setBeads([]) },
    ]);
  };

  const pickWristSize = (size: number) => {
    setWristSize(size);
    saveWristSize(size);
  };

  const buildDesign = (): BraceletDesign => ({
    id: `${Date.now()}`,
    name: designName.trim() || 'Mi pulsera personalizada',
    beads,
    wristSize,
    basePrice: BRACELET_BASE_PRICE,
    totalPrice,
  });

  const handleAddToCart = () => {
    if (beads.length < 3) {
      Toast.show({ type: 'error', text1: 'Agrega al menos 3 piezas' });
      return;
    }
    addCustomDesign(buildDesign());
    Toast.show({
      type: 'success',
      text1: '¡Tu diseño está en el carrito!',
      text2: `${beads.length} piezas · ${money(totalPrice)}`,
    });
    setBeads([]);
    setDesignName('');
  };

  // Los diseños se guardan en el teléfono: no hace falta cuenta
  const handleSaveDesign = () => {
    if (beads.length < 3) {
      Toast.show({ type: 'error', text1: 'Agrega al menos 3 piezas' });
      return;
    }
    const design = buildDesign();
    addDesign(design);
    Toast.show({ type: 'success', text1: 'Diseño guardado', text2: design.name });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.headerTitle}>Crea tu pulsera</Text>
              <Text style={styles.headerSub}>Hecha a mano, pieza por pieza</Text>
            </View>
            <TouchableOpacity
              style={styles.savedBtn}
              onPress={() => router.push('/mis-disenos')}
            >
              <Ionicons name="bookmark-outline" size={16} color={Colors.primary} />
              <Text style={styles.savedBtnText}>Mis diseños</Text>
            </TouchableOpacity>
          </View>

          {/* TU PULSERA: cordón + acciones + medidor, todo en una tarjeta */}
          <View style={styles.card}>
            <BraceletPreview beads={beads} onRemoveAt={removeAt} />

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.miniBtn, !beads.length && styles.miniBtnOff]}
                onPress={undo}
                disabled={!beads.length}
              >
                <Ionicons
                  name="arrow-undo-outline"
                  size={16}
                  color={beads.length ? Colors.textSecondary : Colors.textMuted}
                />
                <Text style={[styles.miniBtnText, !beads.length && styles.disabledText]}>
                  Deshacer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.miniBtn, !beads.length && styles.miniBtnOff]}
                onPress={clearAll}
                disabled={!beads.length}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={beads.length ? Colors.error : Colors.textMuted}
                />
                <Text style={[styles.miniBtnText, !beads.length && styles.disabledText]}>
                  Empezar de nuevo
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{beads.length}</Text>
                <Text style={styles.statLabel}>piezas</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{wristSize} cm</Text>
                <Text style={styles.statLabel}>muñeca</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{Math.max(remaining, 0)}</Text>
                <Text style={styles.statLabel}>caben más</Text>
              </View>
            </View>

            <Text style={[styles.lengthHint, isFull && styles.lengthHintFull]}>
              {isFull
                ? `Llegaste al largo de ${wristSize} cm. Elige una talla mayor para seguir.`
                : `En ${wristSize} cm caben ${maxBeads} piezas en total.`}
            </Text>
          </View>

          {/* TALLA DE MUÑECA */}
          <Section
            title="Talla de muñeca"
            hint="La usamos para calcular el largo de tu pulsera."
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {WRIST_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.chip, wristSize === size && styles.chipActive]}
                  onPress={() => pickWristSize(size)}
                >
                  <Text style={[styles.chipText, wristSize === size && styles.chipTextActive]}>
                    {size} cm
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Section>

          {/* PIEZAS */}
          <Section
            title="Elige tus piezas"
            hint="Toca una pieza para sumarla al cordón."
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {BEAD_KINDS.map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.chip, kind === k && styles.chipActive]}
                  onPress={() => setKind(k)}
                >
                  <Text style={[styles.chipText, kind === k && styles.chipTextActive]}>
                    {BEAD_KIND_LABEL[k]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {kind === 'letra' ? (
              <View style={styles.letterBox}>
                <Text style={styles.letterLabel}>Escribe un nombre o una palabra</Text>
                <View style={styles.letterRow}>
                  <TextInput
                    style={styles.letterInput}
                    value={letterText}
                    onChangeText={setLetterText}
                    placeholder="Ej: SOFIA"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={12}
                    returnKeyType="done"
                    onSubmitEditing={addLetters}
                  />
                  <TouchableOpacity style={styles.letterAddBtn} onPress={addLetters}>
                    <Ionicons name="add" size={22} color={Colors.black} />
                  </TouchableOpacity>
                </View>
                <View style={styles.letterStyleRow}>
                  {palette.map((bead) => (
                    <TouchableOpacity
                      key={bead.id}
                      style={[
                        styles.letterStyleChip,
                        letterBeadId === bead.id && styles.letterStyleChipActive,
                      ]}
                      onPress={() => setLetterBeadId(bead.id)}
                    >
                      <View style={[styles.letterSwatch, { backgroundColor: bead.color }]} />
                      <Text style={styles.letterStyleText}>{bead.label}</Text>
                      <Text style={styles.letterStylePrice}>{money(bead.price)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <FlatList
                data={palette}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(b) => b.id}
                contentContainerStyle={styles.paletteRow}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.paletteCard}
                    onPress={() => addBead(item)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.paletteSwatch,
                        {
                          backgroundColor: item.color,
                          width: Math.max(item.size, 22),
                          height: Math.max(item.size, 22),
                          borderRadius: Math.max(item.size, 22) / 2,
                        },
                      ]}
                    >
                      {!!item.symbol && <Text style={styles.paletteSymbol}>{item.symbol}</Text>}
                    </View>
                    <Text style={styles.paletteLabel} numberOfLines={2}>{item.label}</Text>
                    <Text style={styles.palettePrice}>{money(item.price)}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </Section>

          {/* NOMBRE Y DESGLOSE */}
          <Section
            title="Ponle nombre a tu diseño"
            hint="Así lo reconoces en «Mis diseños» y en el pedido."
          >
            <View style={styles.sectionBody}>
              <TextInput
                style={styles.nameInput}
                value={designName}
                onChangeText={setDesignName}
                placeholder="Mi pulsera personalizada"
                placeholderTextColor={Colors.textMuted}
                maxLength={40}
                returnKeyType="done"
              />

              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Cordón + armado a mano</Text>
                  <Text style={styles.breakdownValue}>{money(BRACELET_BASE_PRICE)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{beads.length} piezas elegidas</Text>
                  <Text style={styles.breakdownValue}>
                    {money(totalPrice - BRACELET_BASE_PRICE)}
                  </Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownTotalLabel}>Total</Text>
                  <Text style={styles.breakdownTotalValue}>{money(totalPrice)}</Text>
                </View>
              </View>
            </View>
          </Section>
        </ScrollView>

        {/* BARRA FIJA: el precio y el botón siempre a la vista */}
        <View style={styles.footer}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerValue}>{money(totalPrice)}</Text>
          </View>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSaveDesign}>
            <Ionicons name="bookmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddToCart}>
            <Ionicons name="bag-add-outline" size={19} color={Colors.black} />
            <Text style={styles.primaryBtnText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({
  title, hint, children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!hint && <Text style={styles.sectionHint}>{hint}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { paddingBottom: Spacing.lg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  headerSub: { color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
  savedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  savedBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },

  // Tarjeta del cordón
  card: {
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniBtnOff: { opacity: 0.5 },
  miniBtnText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  disabledText: { color: Colors.textMuted },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  statValue: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 3 },
  lengthHint: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  lengthHintFull: { color: Colors.warning },

  // Secciones
  section: { marginTop: Spacing.lg, gap: Spacing.sm },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: Spacing.md,
  },
  sectionHint: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: Spacing.md,
    marginTop: -2,
  },
  sectionBody: { paddingHorizontal: Spacing.md, gap: Spacing.md },

  chipRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingVertical: 2 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.black },

  paletteRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingVertical: 2 },
  paletteCard: {
    width: 96,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: 6,
  },
  paletteSwatch: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  paletteSymbol: { fontSize: 14, fontWeight: '800', color: Colors.white },
  paletteLabel: { color: Colors.textSecondary, fontSize: 11, textAlign: 'center', lineHeight: 15 },
  palettePrice: { color: Colors.primary, fontSize: 11, fontWeight: '700' },

  letterBox: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  letterLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  letterRow: { flexDirection: 'row', gap: Spacing.sm },
  letterInput: {
    flex: 1,
    backgroundColor: Colors.backgroundSurface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
    letterSpacing: 2,
  },
  letterAddBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterStyleRow: { gap: Spacing.sm },
  letterStyleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  letterStyleChipActive: { borderColor: Colors.primary, backgroundColor: Colors.goldOverlay },
  letterSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#0006' },
  letterStyleText: { flex: 1, color: Colors.textSecondary, fontSize: 13 },
  letterStylePrice: { color: Colors.primary, fontSize: 12, fontWeight: '700' },

  nameInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  breakdown: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { color: Colors.textSecondary, fontSize: 13 },
  breakdownValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  breakdownDivider: { height: 1, backgroundColor: Colors.border },
  breakdownTotalLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  breakdownTotalValue: { color: Colors.primary, fontSize: 18, fontWeight: '900' },

  // Barra fija inferior
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  footerPrice: { minWidth: 86 },
  footerLabel: { color: Colors.textMuted, fontSize: 11 },
  footerValue: { color: Colors.primary, fontSize: 18, fontWeight: '900' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  primaryBtnText: { color: Colors.black, fontSize: 14, fontWeight: '800' },
});

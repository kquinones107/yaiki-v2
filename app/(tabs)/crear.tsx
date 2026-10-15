// =============================================
// CREAR — Diseñador de pulseras personalizadas
// Arma la pulsera pieza por pieza, con precio en vivo
// =============================================
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Alert,
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
import { calcDesignPrice, maxBeadsForWrist, saveDesign } from '@/services/designService';
import { useCartStore } from '@/store/cartStore';
import { useCustomerStore } from '@/store/customerStore';
import { Bead, BraceletDesign, DesignBead } from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

export default function CrearScreen() {
  const addCustomDesign = useCartStore((s) => s.addCustomDesign);
  const { customer, saveWristSize } = useCustomerStore();

  const [beads, setBeads] = useState<DesignBead[]>([]);
  const [wristSize, setWristSize] = useState<number>(customer?.wristSize ?? 16);
  const [kind, setKind] = useState<Bead['kind']>('piedra');
  const [letterBeadId, setLetterBeadId] = useState<string>('l-dorada');
  const [letterText, setLetterText] = useState('');
  const [designName, setDesignName] = useState('');
  const [saving, setSaving] = useState(false);

  const palette = useMemo(() => BEADS.filter((b) => b.kind === kind), [kind]);
  const totalPrice = useMemo(() => calcDesignPrice(beads), [beads]);
  const maxBeads = maxBeadsForWrist(wristSize);
  const isOverLength = beads.length > maxBeads;

  const addBead = (bead: Bead, letter?: string) => {
    if (beads.length >= maxBeads) {
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
    const room = maxBeads - beads.length;
    if (chars.length > room) {
      Toast.show({
        type: 'error',
        text1: 'No alcanza el espacio',
        text2: `Solo caben ${room} piezas más en ${wristSize} cm.`,
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

  const handleSaveDesign = async () => {
    if (beads.length < 3) {
      Toast.show({ type: 'error', text1: 'Agrega al menos 3 piezas' });
      return;
    }
    if (!customer) {
      Alert.alert(
        'Crea tu cuenta',
        'Guarda tus diseños para volver a pedirlos cuando quieras.',
        [
          { text: 'Después', style: 'cancel' },
          { text: 'Entrar', onPress: () => router.push('/(tabs)/cuenta') },
        ]
      );
      return;
    }
    setSaving(true);
    try {
      const design = buildDesign();
      await saveDesign(customer.uid, {
        name: design.name,
        beads: design.beads,
        wristSize: design.wristSize,
        basePrice: design.basePrice,
        totalPrice: design.totalPrice,
      });
      if (customer.wristSize !== wristSize) await saveWristSize(wristSize);
      Toast.show({ type: 'success', text1: 'Diseño guardado', text2: design.name });
    } catch {
      Toast.show({ type: 'error', text1: 'No pudimos guardar el diseño' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Crea tu pulsera</Text>
            <Text style={styles.headerSub}>Hecha a mano, pieza por pieza</Text>
          </View>
          <TouchableOpacity
            style={styles.savedBtn}
            onPress={() => router.push('/mis-disenos')}
          >
            <Ionicons name="bookmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.savedBtnText}>Mis diseños</Text>
          </TouchableOpacity>
        </View>

        {/* PREVIEW */}
        <View style={styles.block}>
          <BraceletPreview beads={beads} onRemoveAt={removeAt} />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.miniBtn} onPress={undo} disabled={!beads.length}>
              <Ionicons
                name="arrow-undo-outline"
                size={16}
                color={beads.length ? Colors.textSecondary : Colors.textMuted}
              />
              <Text style={[styles.miniBtnText, !beads.length && styles.disabledText]}>
                Deshacer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniBtn} onPress={clearAll} disabled={!beads.length}>
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
        </View>

        {/* MEDIDOR EN VIVO */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{beads.length}</Text>
            <Text style={styles.statLabel}>piezas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{wristSize} cm</Text>
            <Text style={styles.statLabel}>muñeca</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxGold]}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{money(totalPrice)}</Text>
            <Text style={styles.statLabel}>total COP</Text>
          </View>
        </View>

        {isOverLength && (
          <Text style={styles.warning}>
            ⚠️ Tu diseño supera el largo de {wristSize} cm. Quita piezas o elige una talla mayor.
          </Text>
        )}

        {/* TALLA DE MUÑECA */}
        <Text style={styles.sectionTitle}>Talla de muñeca</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {WRIST_SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.chip, wristSize === size && styles.chipActive]}
              onPress={() => setWristSize(size)}
            >
              <Text style={[styles.chipText, wristSize === size && styles.chipTextActive]}>
                {size} cm
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SELECTOR DE TIPO */}
        <Text style={styles.sectionTitle}>Elige tus piezas</Text>
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

        {/* PALETA */}
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
                maxLength={12}
              />
              <TouchableOpacity style={styles.letterAddBtn} onPress={addLetters}>
                <Ionicons name="add" size={20} color={Colors.black} />
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
                      width: Math.max(item.size, 20),
                      height: Math.max(item.size, 20),
                      borderRadius: Math.max(item.size, 20) / 2,
                    },
                  ]}
                >
                  {!!item.symbol && <Text style={styles.paletteSymbol}>{item.symbol}</Text>}
                </View>
                <Text style={styles.paletteLabel} numberOfLines={1}>{item.label}</Text>
                <Text style={styles.palettePrice}>{money(item.price)}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* NOMBRE DEL DISEÑO */}
        <Text style={styles.sectionTitle}>Ponle nombre a tu diseño</Text>
        <TextInput
          style={styles.nameInput}
          value={designName}
          onChangeText={setDesignName}
          placeholder="Mi pulsera personalizada"
          placeholderTextColor={Colors.textMuted}
          maxLength={40}
        />

        {/* DESGLOSE */}
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

        {/* ACCIONES */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleSaveDesign}
            disabled={saving}
          >
            <Ionicons name="bookmark-outline" size={18} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>
              {saving ? 'Guardando…' : 'Guardar diseño'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, isOverLength && styles.primaryBtnDisabled]}
            onPress={handleAddToCart}
            disabled={isOverLength}
          >
            <Ionicons name="bag-add-outline" size={20} color={Colors.black} />
            <Text style={styles.primaryBtnText}>Agregar al carrito</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  headerSub: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  savedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  savedBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  block: { paddingHorizontal: Spacing.md, marginTop: Spacing.sm },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  miniBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniBtnText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  disabledText: { color: Colors.textMuted },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  statBoxGold: { borderColor: Colors.borderGold },
  statValue: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  warning: {
    color: Colors.warning,
    fontSize: 12,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  chipRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.black },
  paletteRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  paletteCard: {
    width: 86,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  paletteSwatch: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  paletteSymbol: { fontSize: 14, fontWeight: '800', color: Colors.white },
  paletteLabel: { color: Colors.textSecondary, fontSize: 11, textAlign: 'center' },
  palettePrice: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  letterBox: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  letterLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  letterRow: { flexDirection: 'row', gap: Spacing.sm },
  letterInput: {
    flex: 1,
    backgroundColor: Colors.backgroundSurface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 15,
    letterSpacing: 2,
  },
  letterAddBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterStyleRow: { gap: Spacing.sm, marginTop: 4 },
  letterStyleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  letterStyleChipActive: { borderColor: Colors.primary, backgroundColor: Colors.goldOverlay },
  letterSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#0006' },
  letterStyleText: { flex: 1, color: Colors.textSecondary, fontSize: 13 },
  letterStylePrice: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  nameInput: {
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  breakdown: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  primaryBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  primaryBtnDisabled: { backgroundColor: Colors.textMuted },
  primaryBtnText: { color: Colors.black, fontSize: 14, fontWeight: '800' },
});

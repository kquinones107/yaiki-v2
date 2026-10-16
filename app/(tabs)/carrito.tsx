// =============================================
// CARRITO SCREEN — Carrito de compras
// Lista simple: cada línea es un producto con su
// nombre, su cantidad y lo que suma.
// Checkout dentro de la app (pago contra entrega)
// =============================================
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BeadView } from '@/components/BraceletPreview';
import { imageSourceFor } from '@/components/ProductImage';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { shippingCostFor, FREE_SHIPPING_FROM } from '@/services/orderService';
import { CartItem, PAYMENT_NOTICE } from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

/** Cuántas piezas del diseño se ven antes de resumir el resto */
const PREVIEW_BEADS = 9;

function DesignStrip({ item }: { item: CartItem }) {
  const design = item.design!;
  const shown = design.beads.slice(0, PREVIEW_BEADS);
  const rest = design.beads.length - shown.length;

  return (
    <View style={styles.strip}>
      {shown.map((b) => (
        <BeadView key={b.slotId} beadId={b.beadId} letter={b.letter} scale={0.5} />
      ))}
      {rest > 0 && <Text style={styles.stripRest}>+{rest}</Text>}
    </View>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <View style={styles.row}>
      {item.design ? (
        <View style={styles.thumb}>
          <Ionicons name="color-palette-outline" size={24} color={Colors.primary} />
        </View>
      ) : (
        <Image
          source={imageSourceFor(item.product?.categoryId, item.image)}
          style={styles.thumb}
          resizeMode="cover"
        />
      )}

      <View style={styles.rowBody}>
        {/* Nombre y lo que suma esta línea */}
        <View style={styles.titleLine}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.lineTotal}>{money(item.unitPrice * item.quantity)}</Text>
        </View>

        {item.design ? (
          <>
            <Text style={styles.detail}>
              {item.design.wristSize} cm · {item.design.beads.length} piezas · {money(item.unitPrice)} c/u
            </Text>
            <DesignStrip item={item} />
          </>
        ) : (
          <Text style={styles.detail}>{money(item.unitPrice)} c/u</Text>
        )}

        {/* Cantidad y quitar */}
        <View style={styles.actions}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              hitSlop={8}
            >
              <Ionicons name="remove" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              hitSlop={8}
            >
              <Ionicons name="add" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            hitSlop={10}
            style={styles.removeBtn}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.removeText}>Quitar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CarritoScreen() {
  const { items, totalPrice, totalItems, clearCart } = useCartStore();

  const subtotal = totalPrice();
  const shipping = shippingCostFor(subtotal);
  const count = totalItems();
  const falta = FREE_SHIPPING_FROM - subtotal;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi carrito</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>
            Explora nuestras colecciones o crea tu propia pulsera personalizada
          </Text>
          <TouchableOpacity
            style={styles.discoverBtn}
            onPress={() => router.push('/(tabs)/catalogo')}
          >
            <Text style={styles.discoverBtnText}>Explorar catálogo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createLink}
            onPress={() => router.push('/(tabs)/crear')}
          >
            <Ionicons name="color-palette-outline" size={18} color={Colors.primary} />
            <Text style={styles.createLinkText}>Crear mi pulsera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>Mi carrito</Text>
          <Text style={styles.headerSubtitle}>
            {count} {count === 1 ? 'producto' : 'productos'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          hitSlop={8}
          onPress={() => Alert.alert('Vaciar carrito', '¿Quitar todos los productos?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Vaciar', style: 'destructive', onPress: clearCart },
          ])}
        >
          <Text style={styles.clearBtnText}>Vaciar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartRow item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* RESUMEN Y CHECKOUT */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{money(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío</Text>
          <Text style={[styles.summaryValue, shipping === 0 && styles.freeShipping]}>
            {shipping === 0 ? 'Gratis' : money(shipping)}
          </Text>
        </View>
        {shipping > 0 && (
          <Text style={styles.freeShippingHint}>
            Te faltan {money(falta)} para el envío gratis
          </Text>
        )}

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{money(subtotal + shipping)} COP</Text>
        </View>

        <View style={styles.paymentNotice}>
          <Ionicons name="cash-outline" size={15} color={Colors.success} />
          <Text style={styles.paymentNoticeText}>{PAYMENT_NOTICE}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
          <Ionicons name="bag-check-outline" size={21} color={Colors.black} />
          <Text style={styles.checkoutBtnText}>Finalizar pedido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ---- Header ----
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTexts: { gap: 2 },
  headerTitle: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  headerSubtitle: { color: Colors.textMuted, fontSize: 13 },
  clearBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

  // ---- Lista ----
  list: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  separator: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },

  // ---- Línea de producto ----
  row: { flexDirection: 'row', gap: Spacing.md },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBody: { flex: 1, gap: 6 },
  titleLine: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  name: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  lineTotal: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
  detail: { color: Colors.textMuted, fontSize: 12, lineHeight: 16 },

  // Miniatura de la pulsera armada
  strip: { flexDirection: 'row', alignItems: 'center', gap: 2, flexWrap: 'wrap' },
  stripRest: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', marginLeft: 4 },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qty: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'center',
  },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 4 },
  removeText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },

  // ---- Footer / resumen ----
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
    gap: 6,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14 },
  summaryValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  freeShipping: { color: Colors.success, fontWeight: '700' },
  freeShippingHint: { color: Colors.textMuted, fontSize: 11, lineHeight: 15 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  totalLabel: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  totalValue: { color: Colors.primary, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  paymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: 2,
  },
  paymentNoticeText: { flex: 1, color: Colors.textSecondary, fontSize: 11, lineHeight: 16 },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  checkoutBtnText: { color: Colors.black, fontSize: 16, fontWeight: '800' },

  // ---- Vacío ----
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  discoverBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  discoverBtnText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
  createLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  createLinkText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});

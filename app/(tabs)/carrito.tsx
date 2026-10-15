// =============================================
// CARRITO SCREEN — Carrito de compras
// Checkout dentro de la app (pago contra entrega)
// =============================================
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BraceletPreview from '@/components/BraceletPreview';
import { imageSourceFor } from '@/components/ProductImage';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { shippingCostFor, FREE_SHIPPING_FROM } from '@/services/orderService';
import { designSummary } from '@/services/designService';
import { CartItem, PAYMENT_NOTICE } from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        {item.design ? (
          <View style={styles.designThumb}>
            <Ionicons name="color-palette-outline" size={26} color={Colors.primary} />
          </View>
        ) : (
          <Image
            source={imageSourceFor(item.product?.categoryId, item.image)}
            style={styles.itemImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          {!!item.design && (
            <Text style={styles.itemDesign} numberOfLines={2}>
              {designSummary(item.design)}
            </Text>
          )}
          <Text style={styles.itemPrice}>{money(item.unitPrice)}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={14} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemTotal}>{money(item.unitPrice * item.quantity)}</Text>
          <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Vista del diseño personalizado */}
      {!!item.design && (
        <View style={styles.designPreview}>
          <BraceletPreview beads={item.design.beads} scale={0.7} />
        </View>
      )}
    </View>
  );
}

export default function CarritoScreen() {
  const { items, totalPrice, totalItems, clearCart } = useCartStore();

  const subtotal = totalPrice();
  const shipping = shippingCostFor(subtotal);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Carrito</Text>
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
            <Text style={styles.discoverBtnText}>Explorar Catálogo</Text>
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
        <Text style={styles.headerTitle}>Mi Carrito ({totalItems()})</Text>
        <TouchableOpacity onPress={() => Alert.alert('Limpiar carrito', '¿Eliminar todos los productos?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Limpiar', style: 'destructive', onPress: clearCart },
        ])}>
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartItemRow item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* RESUMEN Y CHECKOUT */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{money(subtotal)} COP</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'Gratis' : `${money(shipping)} COP`}
          </Text>
        </View>
        {shipping > 0 && (
          <Text style={styles.freeShippingHint}>
            Envío gratis en compras desde {money(FREE_SHIPPING_FROM)}
          </Text>
        )}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{money(subtotal + shipping)} COP</Text>
        </View>
        <View style={styles.paymentNotice}>
          <Ionicons name="cash-outline" size={16} color={Colors.success} />
          <Text style={styles.paymentNoticeText}>{PAYMENT_NOTICE}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
          <Ionicons name="bag-check-outline" size={22} color={Colors.black} />
          <Text style={styles.checkoutBtnText}>Finalizar pedido</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  list: { padding: Spacing.md },
  itemCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemRow: { flexDirection: 'row' },
  itemImage: { width: 100, height: 110 },
  designThumb: {
    width: 100,
    height: 110,
    backgroundColor: Colors.backgroundSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1, padding: Spacing.sm, justifyContent: 'space-between', gap: 2 },
  itemName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  itemDesign: { color: Colors.textMuted, fontSize: 10, lineHeight: 14 },
  itemPrice: { color: Colors.textSecondary, fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: BorderRadius.full,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', minWidth: 18, textAlign: 'center' },
  itemRight: { padding: Spacing.sm, justifyContent: 'space-between', alignItems: 'flex-end' },
  itemTotal: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  deleteBtn: { padding: 4 },
  designPreview: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  separator: { height: Spacing.sm },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
    gap: 6,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14 },
  summaryValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  freeShippingHint: { color: Colors.textMuted, fontSize: 11 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  totalLabel: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  totalValue: { color: Colors.primary, fontSize: 20, fontWeight: '900' },
  paymentNotice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
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
    marginTop: Spacing.sm,
  },
  checkoutBtnText: { color: Colors.black, fontSize: 16, fontWeight: '800' },
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

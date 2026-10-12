// =============================================
// CARRITO SCREEN — Carrito de compras
// Checkout vía WhatsApp
// =============================================
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/types';

const WHATSAPP_NUMBER = '+573187887223';

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity } = item;

  return (
    <View style={styles.itemRow}>
      <Image
        source={{ uri: product.images[0] || 'https://via.placeholder.com/80' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.itemPrice}>${product.price.toLocaleString('es-CO')}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(product.id, quantity - 1)}
          >
            <Ionicons name="remove" size={14} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(product.id, quantity + 1)}
          >
            <Ionicons name="add" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemTotal}>
          ${(product.price * quantity).toLocaleString('es-CO')}
        </Text>
        <TouchableOpacity onPress={() => removeItem(product.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CarritoScreen() {
  const { items, totalPrice, totalItems, clearCart } = useCartStore();

  const handleWhatsAppCheckout = async () => {
    if (items.length === 0) return;

    const itemsList = items
      .map((item) => `• ${item.product.name} x${item.quantity} — $${(item.product.price * item.quantity).toLocaleString('es-CO')}`)
      .join('\n');

    const total = totalPrice().toLocaleString('es-CO');
    const message = `¡Hola! 👋 Me gustaría hacer el siguiente pedido:\n\n${itemsList}\n\n💰 *Total: $${total} COP*\n\n¿Me puedes confirmar disponibilidad? 🙏`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
    }
  };

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
            Explora nuestras colecciones y agrega tus accesorios favoritos
          </Text>
          <TouchableOpacity
            style={styles.discoverBtn}
            onPress={() => router.push('/(tabs)/catalogo')}
          >
            <Text style={styles.discoverBtnText}>Explorar Catálogo</Text>
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
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => <CartItemRow item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* RESUMEN Y CHECKOUT */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${totalPrice().toLocaleString('es-CO')} COP</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.whatsappNote}>
          📱 El pedido se envía por WhatsApp para coordinar entrega y pago.
        </Text>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleWhatsAppCheckout}>
          <Ionicons name="logo-whatsapp" size={22} color={Colors.black} />
          <Text style={styles.checkoutBtnText}>Pedir por WhatsApp</Text>
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
  itemRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemImage: { width: 100, height: 110 },
  itemInfo: { flex: 1, padding: Spacing.sm, justifyContent: 'space-between' },
  itemName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  itemPrice: { color: Colors.textSecondary, fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: BorderRadius.full,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  qtyText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  itemRight: {
    padding: Spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  itemTotal: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  deleteBtn: { padding: 4 },
  separator: { height: Spacing.sm },
  footer: {
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.md,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  summaryLabel: { color: Colors.textSecondary, fontSize: 15 },
  summaryValue: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  whatsappNote: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  checkoutBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadow.card,
  },
  checkoutBtnText: { color: Colors.black, fontSize: 16, fontWeight: '800' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyIcon: { fontSize: 72, marginBottom: Spacing.md },
  emptyTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  discoverBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  discoverBtnText: { color: Colors.black, fontWeight: '800', fontSize: 14 },
});

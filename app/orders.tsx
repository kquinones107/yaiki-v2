// =============================================
// MIS PEDIDOS — Historial de la clienta
// =============================================
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getMyOrders } from '@/services/orderService';
import { useCustomerStore } from '@/store/customerStore';
import { ORDER_STATUS_LABEL, Order, OrderStatus } from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

const STATUS_COLOR: Record<OrderStatus, string> = {
  recibido: Colors.info,
  preparacion: Colors.warning,
  enviado: Colors.primary,
  entregado: Colors.success,
  cancelado: Colors.error,
};

const formatDate = (value: Date | string) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function OrdersScreen() {
  const { customer } = useCustomerStore();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my_orders', customer?.uid],
    queryFn: () => getMyOrders(customer!.uid),
    enabled: !!customer,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis pedidos</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🧾</Text>
          <Text style={styles.emptyTitle}>Todavía no tienes pedidos</Text>
          <Text style={styles.emptyText}>
            Cuando hagas tu primer pedido podrás seguir su estado desde aquí.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(tabs)/catalogo')}
          >
            <Text style={styles.primaryBtnText}>Ver catálogo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => <OrderRow order={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function OrderRow({ order }: { order: Order }) {
  const status = order.status as OrderStatus;
  const itemCount = order.lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.orderTop}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <View style={[styles.statusPill, { borderColor: STATUS_COLOR[status] }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>
            {ORDER_STATUS_LABEL[status]}
          </Text>
        </View>
      </View>
      <Text style={styles.orderMeta}>
        {formatDate(order.createdAt)} · {itemCount} {itemCount === 1 ? 'pieza' : 'piezas'}
      </Text>
      <View style={styles.orderBottom}>
        <Text style={styles.orderTotal}>{money(order.total)} COP</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '700' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.md,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  primaryBtnText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
  list: { padding: Spacing.md },
  orderCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  statusPill: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderMeta: { color: Colors.textMuted, fontSize: 12 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
});

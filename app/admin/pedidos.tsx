// =============================================
// ADMIN — Pedidos recibidos y cambio de estado
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getAllOrders, updateOrderStatus } from '@/services/orderService';
import {
  ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, Order, OrderStatus,
} from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

const formatDate = (value: Date | string) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

export default function AdminPedidosScreen() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: getAllOrders,
  });

  const visible = filter === 'todos' ? orders : orders.filter((o) => o.status === filter);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin_orders'] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos ({orders.length})</Text>
        <TouchableOpacity onPress={refresh} style={styles.backBtn}>
          <Ionicons name="refresh" size={20} color={Colors.adminLight} />
        </TouchableOpacity>
      </View>

      {/* FILTROS */}
      <FlatList
        data={['todos', ...ORDER_STATUS_FLOW, 'cancelado'] as (OrderStatus | 'todos')[]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(f) => f}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item === 'todos' ? 'Todos' : ORDER_STATUS_LABEL[item as OrderStatus]}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.adminAccent} />
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No hay pedidos en este estado.</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => <AdminOrderCard order={item} onChanged={refresh} />}
        />
      )}
    </SafeAreaView>
  );
}

function AdminOrderCard({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [tracking, setTracking] = useState(order.trackingCode ?? '');
  const [saving, setSaving] = useState(false);

  const changeStatus = async (status: OrderStatus) => {
    setSaving(true);
    try {
      await updateOrderStatus(order.id, status, tracking.trim() || undefined);
      Toast.show({ type: 'success', text1: `Pedido ${order.orderNumber}`, text2: ORDER_STATUS_LABEL[status] });
      onChanged();
    } catch {
      Alert.alert('Error', 'No pudimos actualizar el pedido.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHead}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.85}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.orderMeta}>
            {order.shipping.fullName} · {order.shipping.city} · {formatDate(order.createdAt)}
          </Text>
        </View>
        <View style={styles.cardHeadRight}>
          <Text style={styles.orderTotal}>{money(order.total)}</Text>
          <Text style={styles.orderStatus}>{ORDER_STATUS_LABEL[order.status as OrderStatus]}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          {/* PIEZAS */}
          {order.lines.map((line, i) => (
            <View key={i} style={styles.lineBlock}>
              <Text style={styles.lineName}>{line.quantity}× {line.name}</Text>
              {!!line.designSummary && (
                <Text style={styles.lineDesign}>{line.designSummary}</Text>
              )}
            </View>
          ))}

          {/* ENVÍO */}
          <View style={styles.shipBox}>
            <Text style={styles.shipLine}>{order.shipping.address}</Text>
            <Text style={styles.shipLine}>{order.shipping.phone}</Text>
            {!!order.shipping.notes && (
              <Text style={styles.shipNotes}>“{order.shipping.notes}”</Text>
            )}
            <Text style={styles.shipPay}>
              Cobrar al entregar: {money(order.total)} (contra entrega)
            </Text>
          </View>

          {/* GUÍA */}
          <TextInput
            style={styles.input}
            value={tracking}
            onChangeText={setTracking}
            placeholder="Número de guía (opcional)"
            placeholderTextColor={Colors.textMuted}
          />

          {/* ESTADOS */}
          <View style={styles.statusRow}>
            {ORDER_STATUS_FLOW.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.statusBtn, order.status === status && styles.statusBtnActive]}
                onPress={() => changeStatus(status)}
                disabled={saving}
              >
                <Text
                  style={[styles.statusBtnText, order.status === status && styles.statusBtnTextActive]}
                >
                  {ORDER_STATUS_LABEL[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() =>
              Alert.alert('Cancelar pedido', `¿Cancelar ${order.orderNumber}?`, [
                { text: 'No', style: 'cancel' },
                { text: 'Cancelar pedido', style: 'destructive', onPress: () => changeStatus('cancelado') },
              ])
            }
            disabled={saving}
          >
            <Text style={styles.cancelBtnText}>Cancelar pedido</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  filterRow: { padding: Spacing.md, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.adminAccent, borderColor: Colors.adminAccent },
  filterText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: Colors.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  cardHeadRight: { alignItems: 'flex-end' },
  orderNumber: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800' },
  orderMeta: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  orderTotal: { color: Colors.primary, fontSize: 14, fontWeight: '800' },
  orderStatus: { color: Colors.adminLight, fontSize: 11, fontWeight: '600' },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  lineBlock: { gap: 2 },
  lineName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  lineDesign: { color: Colors.primary, fontSize: 11, lineHeight: 16 },
  shipBox: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 2,
  },
  shipLine: { color: Colors.textSecondary, fontSize: 12 },
  shipNotes: { color: Colors.textMuted, fontSize: 11, fontStyle: 'italic' },
  shipPay: { color: Colors.success, fontSize: 12, fontWeight: '700', marginTop: 4 },
  input: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statusBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusBtnActive: { backgroundColor: Colors.adminAccent, borderColor: Colors.adminAccent },
  statusBtnText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  statusBtnTextActive: { color: Colors.white },
  cancelBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  cancelBtnText: { color: Colors.error, fontSize: 12, fontWeight: '700' },
});

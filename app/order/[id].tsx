// =============================================
// DETALLE DE PEDIDO — Seguimiento del estado
// =============================================
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getOrderById } from '@/services/orderService';
import {
  ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, OrderStatus, PAYMENT_NOTICE,
} from '@/types';

const WHATSAPP_NUMBER = '+573187887223';
const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

const formatDate = (value: Date | string) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function OrderDetailScreen() {
  const { id, nuevo } = useLocalSearchParams<{ id: string; nuevo?: string }>();
  const isNew = nuevo === '1';

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>No encontramos este pedido</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.backLink}>← Volver a la tienda</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status as OrderStatus);
  const isCancelled = order.status === 'cancelado';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (isNew ? router.replace('/(tabs)') : router.back())}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedido {order.orderNumber}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* CONFIRMACIÓN */}
        {isNew && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={44} color={Colors.success} />
            <Text style={styles.successTitle}>¡Pedido confirmado!</Text>
            <Text style={styles.successText}>
              Guardamos tu pedido {order.orderNumber}. Yaiki te escribe para coordinar la entrega.
            </Text>
          </View>
        )}

        {/* ESTADO */}
        <Text style={styles.sectionTitle}>Estado del pedido</Text>
        {isCancelled ? (
          <View style={styles.cancelledCard}>
            <Ionicons name="close-circle-outline" size={22} color={Colors.error} />
            <Text style={styles.cancelledText}>Este pedido fue cancelado.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {ORDER_STATUS_FLOW.map((status, i) => {
              const done = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <View key={status} style={styles.timelineRow}>
                  <View style={styles.timelineGutter}>
                    <View style={[styles.timelineDot, done && styles.timelineDotDone]}>
                      {done && <Ionicons name="checkmark" size={12} color={Colors.black} />}
                    </View>
                    {i < ORDER_STATUS_FLOW.length - 1 && (
                      <View style={[styles.timelineBar, i < currentIndex && styles.timelineBarDone]} />
                    )}
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>
                      {ORDER_STATUS_LABEL[status]}
                    </Text>
                    {isCurrent && <Text style={styles.timelineNow}>Estado actual</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {!!order.trackingCode && (
          <View style={styles.trackingCard}>
            <Ionicons name="cube-outline" size={18} color={Colors.primary} />
            <Text style={styles.trackingText}>Guía de envío: {order.trackingCode}</Text>
          </View>
        )}

        {/* PRODUCTOS */}
        <Text style={styles.sectionTitle}>Tu pedido</Text>
        <View style={styles.card}>
          {order.lines.map((line, i) => (
            <View key={i} style={styles.lineBlock}>
              <View style={styles.lineRow}>
                <Text style={styles.lineName}>{line.quantity}× {line.name}</Text>
                <Text style={styles.lineValue}>{money(line.unitPrice * line.quantity)}</Text>
              </View>
              {!!line.designSummary && (
                <Text style={styles.lineDesign}>{line.designSummary}</Text>
              )}
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.lineRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.lineValue}>{money(order.subtotal)}</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.lineValue}>
              {order.shippingCost === 0 ? 'Gratis' : money(order.shippingCost)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.lineRow}>
            <Text style={styles.totalLabel}>Total a pagar al recibir</Text>
            <Text style={styles.totalValue}>{money(order.total)}</Text>
          </View>
        </View>

        {/* PAGO */}
        <View style={styles.paymentCard}>
          <Ionicons name="cash-outline" size={20} color={Colors.success} />
          <Text style={styles.paymentText}>{PAYMENT_NOTICE}</Text>
        </View>

        {/* ENVÍO */}
        <Text style={styles.sectionTitle}>Envío</Text>
        <View style={styles.card}>
          <Text style={styles.shipName}>{order.shipping.fullName}</Text>
          <Text style={styles.shipLine}>{order.shipping.address}</Text>
          <Text style={styles.shipLine}>{order.shipping.city}</Text>
          <Text style={styles.shipLine}>{order.shipping.phone}</Text>
          {!!order.shipping.notes && (
            <Text style={styles.shipNotes}>“{order.shipping.notes}”</Text>
          )}
          <Text style={styles.shipDate}>Pedido realizado el {formatDate(order.createdAt)}</Text>
        </View>

        {/* SOPORTE */}
        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() =>
            Linking.openURL(
              `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hola! Tengo una pregunta sobre mi pedido ${order.orderNumber}.`
              )}`
            )
          }
        >
          <Ionicons name="logo-whatsapp" size={20} color={Colors.textPrimary} />
          <Text style={styles.supportBtnText}>¿Dudas con este pedido? Escríbenos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={() => router.replace('/(tabs)/catalogo')}>
          <Text style={styles.ghostBtnText}>Seguir comprando</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  errorText: { color: Colors.textSecondary, fontSize: 15 },
  backLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
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
  headerTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  scroll: { padding: Spacing.md },
  successCard: {
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.success,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  successTitle: { color: Colors.textPrimary, fontSize: 19, fontWeight: '800' },
  successText: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  timeline: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  timelineRow: { flexDirection: 'row', gap: Spacing.md },
  timelineGutter: { alignItems: 'center', width: 22 },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timelineBar: { width: 2, flex: 1, minHeight: 26, backgroundColor: Colors.border },
  timelineBarDone: { backgroundColor: Colors.primary },
  timelineBody: { flex: 1, paddingBottom: Spacing.md },
  timelineLabel: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  timelineLabelDone: { color: Colors.textPrimary },
  timelineNow: { color: Colors.primary, fontSize: 11, fontWeight: '700', marginTop: 2 },
  cancelledCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(244,67,54,0.12)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  cancelledText: { color: Colors.textSecondary, fontSize: 13 },
  trackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.goldOverlay,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  trackingText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  lineBlock: { gap: 2 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  lineName: { flex: 1, color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  lineValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  lineDesign: { color: Colors.textMuted, fontSize: 11, lineHeight: 16 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  summaryLabel: { color: Colors.textSecondary, fontSize: 13 },
  totalLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  totalValue: { color: Colors.primary, fontSize: 18, fontWeight: '900' },
  paymentCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  paymentText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  shipName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  shipLine: { color: Colors.textSecondary, fontSize: 13 },
  shipNotes: { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  shipDate: { color: Colors.textMuted, fontSize: 11, marginTop: Spacing.sm },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  supportBtnText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  ghostBtn: { alignItems: 'center', paddingVertical: Spacing.md, marginTop: 4 },
  ghostBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});

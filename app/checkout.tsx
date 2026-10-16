// =============================================
// CHECKOUT — Pedido dentro de la app
// Pago contra entrega: la app no recibe dinero
// =============================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { useProfileStore } from '@/store/profileStore';
import { createOrder, shippingCostFor } from '@/services/orderService';
import { PAYMENT_NOTICE, ShippingAddress } from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

export default function CheckoutScreen() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { deviceId, uid, profile, saveProfile } = useProfileStore();

  const [form, setForm] = useState<ShippingAddress>(profile);
  const [submitting, setSubmitting] = useState(false);

  // Precargar los datos guardados en el dispositivo
  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const subtotal = totalPrice();
  const shipping = shippingCostFor(subtotal);
  const total = subtotal + shipping;

  const set = (key: keyof ShippingAddress) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): string | null => {
    if (form.fullName.trim().length < 3) return 'Escribe tu nombre completo.';
    if (form.phone.replace(/\D/g, '').length < 7) return 'Escribe un teléfono válido.';
    if (form.address.trim().length < 6) return 'Escribe tu dirección completa.';
    if (form.city.trim().length < 3) return 'Escribe tu ciudad.';
    return null;
  };

  const handleSubmit = async () => {
    const problem = validate();
    if (problem) {
      Toast.show({ type: 'error', text1: 'Revisa tus datos', text2: problem });
      return;
    }

    setSubmitting(true);
    try {
      saveProfile(form);
      const { id, orderNumber } = await createOrder({
        customerId: uid ?? deviceId,
        customerEmail: form.email?.trim() ?? '',
        items,
        shipping: form,
        paymentMethod: 'contraentrega',
      });
      clearCart();
      router.replace({ pathname: '/order/[id]', params: { id, nuevo: '1', orderNumber } });
    } catch {
      Alert.alert(
        'No pudimos crear tu pedido',
        'Revisa tu conexión e intenta de nuevo. Nada fue cobrado.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Finalizar pedido" />
        <View style={styles.gateBox}>
          <Text style={styles.gateTitle}>Tu carrito está vacío</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(tabs)/catalogo')}>
            <Text style={styles.primaryBtnText}>Ver catálogo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Finalizar pedido" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* DATOS DE ENVÍO */}
        <Text style={styles.sectionTitle}>Datos de envío</Text>
        <Text style={styles.sectionHint}>
          No necesitas crear una cuenta: solo los datos para llevarte el pedido.
          Quedan guardados en tu teléfono para la próxima vez.
        </Text>
        <Field label="Nombre completo" value={form.fullName} onChange={set('fullName')} placeholder="Sofía Ramírez" />
        <Field label="Teléfono / WhatsApp" value={form.phone} onChange={set('phone')} placeholder="300 123 4567" keyboardType="phone-pad" />
        <Field label="Dirección" value={form.address} onChange={set('address')} placeholder="Calle 10 # 5-23, Apto 301" />
        <Field label="Ciudad" value={form.city} onChange={set('city')} placeholder="Medellín" />
        <Field
          label="Correo (opcional)"
          value={form.email ?? ''}
          onChange={set('email')}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
        />
        <Field
          label="Indicaciones para la entrega (opcional)"
          value={form.notes ?? ''}
          onChange={set('notes')}
          placeholder="Portería, horario preferido…"
          multiline
        />

        {/* MÉTODO DE PAGO */}
        <Text style={styles.sectionTitle}>Forma de pago</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentHead}>
            <Ionicons name="cash-outline" size={22} color={Colors.success} />
            <Text style={styles.paymentTitle}>Pago contra entrega</Text>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          </View>
          <Text style={styles.paymentBody}>
            Pagas en efectivo cuando recibas tu pedido. {'\n\n'}
            <Text style={styles.paymentStrong}>
              La app no recibe dinero en este momento y no pide datos de tarjetas.
            </Text>{' '}
            Al confirmar, tu pedido queda registrado y Yaiki te contacta para coordinar la entrega.
          </Text>
        </View>

        {/* RESUMEN */}
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.summaryCard}>
          {items.map((item) => (
            <View key={item.id} style={styles.summaryLine}>
              <Text style={styles.summaryLineName} numberOfLines={1}>
                {item.quantity}× {item.name}
              </Text>
              <Text style={styles.summaryLineValue}>
                {money(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryLineValue}>{money(subtotal)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryLineValue}>
              {shipping === 0 ? 'Gratis' : money(shipping)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryLine}>
            <Text style={styles.totalLabel}>Total a pagar al recibir</Text>
            <Text style={styles.totalValue}>{money(total)}</Text>
          </View>
        </View>

        <Text style={styles.notice}>{PAYMENT_NOTICE}</Text>

        <TouchableOpacity
          style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.black} />
              <Text style={styles.primaryBtnText}>Confirmar pedido</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 32 }} />
    </View>
  );
}

function Field({
  label, value, onChange, placeholder, keyboardType, multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
      />
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
  scroll: { padding: Spacing.md },
  sectionHint: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  field: { marginBottom: Spacing.sm },
  fieldLabel: { color: Colors.textSecondary, fontSize: 12, marginBottom: 4 },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  paymentCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.success,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  paymentHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  paymentTitle: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  paymentBody: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  paymentStrong: { color: Colors.textPrimary, fontWeight: '700' },
  summaryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  summaryLineName: { flex: 1, color: Colors.textSecondary, fontSize: 13 },
  summaryLineValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  summaryLabel: { color: Colors.textSecondary, fontSize: 13 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  totalLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', flex: 1 },
  totalValue: { color: Colors.primary, fontSize: 19, fontWeight: '900' },
  notice: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: Spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: Colors.black, fontSize: 16, fontWeight: '800' },
  gateBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  gateTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  gateText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 21 },
});

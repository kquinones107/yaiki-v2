// =============================================
// CUENTA — Mis datos de envío (sin registro)
// No hay usuarios ni contraseñas: los datos viven
// en el teléfono y solo sirven para enviar el pedido.
// =============================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Linking, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { WRIST_SIZES } from '@/constants/beads';
import { isProfileComplete, useProfileStore } from '@/store/profileStore';
import { ShippingAddress } from '@/types';

const WHATSAPP_NUMBER = '+573187887223';

export default function CuentaScreen() {
  const {
    profile, saveProfile, wristSize, saveWristSize, favorites, designs,
  } = useProfileStore();

  const [form, setForm] = useState<ShippingAddress>(profile);

  useEffect(() => { setForm(profile); }, [profile]);

  const set = (key: keyof ShippingAddress) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const dirty = JSON.stringify(form) !== JSON.stringify(profile);
  const complete = isProfileComplete(form);

  const handleSave = () => {
    if (!complete) {
      Toast.show({
        type: 'error',
        text1: 'Faltan datos',
        text2: 'Nombre, teléfono, dirección y ciudad.',
      });
      return;
    }
    saveProfile(form);
    Toast.show({ type: 'success', text1: 'Datos guardados' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* CABECERA */}
          <View style={styles.head}>
            <Text style={styles.title}>Mis datos</Text>
            <Text style={styles.sub}>
              Sin cuenta ni contraseñas: solo lo necesario para llevarte el pedido.
              Se guardan en este teléfono.
            </Text>
          </View>

          {/* DATOS DE ENVÍO */}
          <View style={styles.card}>
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

            <TouchableOpacity
              style={[styles.saveBtn, !dirty && styles.saveBtnOff]}
              onPress={handleSave}
              disabled={!dirty}
            >
              <Ionicons name="checkmark-circle-outline" size={19} color={Colors.black} />
              <Text style={styles.saveBtnText}>Guardar mis datos</Text>
            </TouchableOpacity>
          </View>

          {/* TALLA DE MUÑECA */}
          <Text style={styles.sectionTitle}>Mi talla de muñeca</Text>
          <Text style={styles.sectionHint}>
            La usamos para ajustar el largo de tus pulseras personalizadas.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {WRIST_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.chip, wristSize === size && styles.chipActive]}
                onPress={() => {
                  saveWristSize(size);
                  Toast.show({ type: 'success', text1: `Talla guardada: ${size} cm` });
                }}
              >
                <Text style={[styles.chipText, wristSize === size && styles.chipTextActive]}>
                  {size} cm
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ACCESOS */}
          <Text style={styles.sectionTitle}>Mis cosas</Text>
          <MenuRow
            icon="receipt-outline"
            title="Mis pedidos"
            desc="Sigue el estado de tus pedidos"
            onPress={() => router.push('/orders')}
          />
          <MenuRow
            icon="heart-outline"
            title="Mis favoritos"
            desc={favorites.length ? `${favorites.length} piezas guardadas` : 'Las piezas que guardaste'}
            onPress={() => router.push('/favoritos')}
          />
          <MenuRow
            icon="bookmark-outline"
            title="Mis diseños"
            desc={designs.length ? `${designs.length} pulseras guardadas` : 'Tus pulseras personalizadas'}
            onPress={() => router.push('/mis-disenos')}
          />
          <MenuRow
            icon="color-palette-outline"
            title="Crear una pulsera"
            desc="Ármala pieza por pieza"
            onPress={() => router.push('/(tabs)/crear')}
          />

          {/* MARCA Y SOPORTE */}
          <Text style={styles.sectionTitle}>Yaiki</Text>
          <MenuRow
            icon="heart-circle-outline"
            title="Sobre Yaiki"
            desc="Quiénes somos y cómo trabajamos"
            onPress={() => router.push('/nosotros')}
          />
          <MenuRow
            icon="logo-whatsapp"
            title="Ayuda por WhatsApp"
            desc="Escríbenos si necesitas algo"
            onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}`)}
          />
          <MenuRow
            icon="shield-checkmark-outline"
            title="Política de privacidad"
            desc="Cómo cuidamos tus datos"
            onPress={() => Linking.openURL('https://zanacode.com/en/privacy-policy/yaiki')}
          />

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={false}
        multiline={multiline}
      />
    </View>
  );
}

function MenuRow({
  icon, title, desc, onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { padding: Spacing.md, paddingTop: Spacing.lg },

  head: { gap: 6, marginBottom: Spacing.md },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },

  card: {
    backgroundColor: Colors.backgroundSurface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  field: { gap: 6 },
  fieldLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  inputMultiline: { minHeight: 76, textAlignVertical: 'top' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  saveBtnOff: { opacity: 0.45 },
  saveBtnText: { color: Colors.black, fontSize: 15, fontWeight: '800' },

  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.lg,
  },
  sectionHint: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  chipRow: { gap: Spacing.sm, paddingVertical: 4 },
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

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.goldOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  menuDesc: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
});

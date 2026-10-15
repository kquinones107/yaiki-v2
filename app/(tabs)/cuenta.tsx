// =============================================
// CUENTA — Registro, login y panel de la clienta
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { WRIST_SIZES } from '@/constants/beads';
import { useCustomerStore } from '@/store/customerStore';
import { useCartStore } from '@/store/cartStore';

const WHATSAPP_NUMBER = '+573187887223';

export default function CuentaScreen() {
  const {
    customer, isLoading, error, login, register, logout, saveWristSize, clearError,
  } = useCustomerStore();
  const clearCart = useCartStore((s) => s.clearCart);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async () => {
    clearError();
    if (mode === 'register') {
      if (name.trim().length < 2) {
        Toast.show({ type: 'error', text1: 'Escribe tu nombre' });
        return;
      }
      const ok = await register(name, email, password);
      if (ok) Toast.show({ type: 'success', text1: `¡Bienvenida, ${name.trim()}!` });
    } else {
      const ok = await login(email, password);
      if (ok) Toast.show({ type: 'success', text1: 'Sesión iniciada' });
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          clearCart();
        },
      },
    ]);
  };

  // ---------- SESIÓN ACTIVA ----------
  if (customer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.profileHead}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {customer.name.trim().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{customer.name}</Text>
              <Text style={styles.profileEmail}>{customer.email}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            </TouchableOpacity>
          </View>

          {/* ACCESOS */}
          <MenuRow
            icon="receipt-outline"
            title="Mis pedidos"
            desc="Sigue el estado de tus pedidos"
            onPress={() => router.push('/orders')}
          />
          <MenuRow
            icon="heart-outline"
            title="Mis favoritos"
            desc="Las piezas que guardaste"
            onPress={() => router.push('/favoritos')}
          />
          <MenuRow
            icon="bookmark-outline"
            title="Mis diseños"
            desc="Tus pulseras personalizadas guardadas"
            onPress={() => router.push('/mis-disenos')}
          />
          <MenuRow
            icon="color-palette-outline"
            title="Crear una pulsera"
            desc="Ármala pieza por pieza"
            onPress={() => router.push('/(tabs)/crear')}
          />

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
                style={[styles.chip, customer.wristSize === size && styles.chipActive]}
                onPress={async () => {
                  await saveWristSize(size);
                  Toast.show({ type: 'success', text1: `Talla guardada: ${size} cm` });
                }}
              >
                <Text
                  style={[styles.chipText, customer.wristSize === size && styles.chipTextActive]}
                >
                  {size} cm
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------- SIN SESIÓN ----------
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authHead}>
          <Text style={styles.authLogo}>✦ YAIKI</Text>
          <Text style={styles.authTitle}>
            {mode === 'login' ? 'Entra a tu cuenta' : 'Crea tu cuenta'}
          </Text>
          <Text style={styles.authSub}>
            Guarda tus diseños y favoritos, haz pedidos y sigue su estado desde la app.
          </Text>
        </View>

        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.switchBtn, mode === 'login' && styles.switchBtnActive]}
            onPress={() => { setMode('login'); clearError(); }}
          >
            <Text style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>
              Entrar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, mode === 'register' && styles.switchBtnActive]}
            onPress={() => { setMode('register'); clearError(); }}
          >
            <Text style={[styles.switchText, mode === 'register' && styles.switchTextActive]}>
              Registrarme
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'register' && (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña (mín. 6 caracteres)"
          placeholderTextColor={Colors.textMuted}
          secureTextEntry
        />

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
          onPress={submit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {mode === 'login' ? 'Entrar' : 'Crear mi cuenta'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Lo que se puede hacer sin cuenta */}
        <Text style={styles.sectionTitle}>Mientras tanto</Text>
        <MenuRow
          icon="color-palette-outline"
          title="Crear una pulsera"
          desc="Diseña y mira el precio en vivo, sin cuenta"
          onPress={() => router.push('/(tabs)/crear')}
        />
        <MenuRow
          icon="grid-outline"
          title="Ver el catálogo"
          desc="Explora todas las colecciones"
          onPress={() => router.push('/(tabs)/catalogo')}
        />
        <MenuRow
          icon="heart-circle-outline"
          title="Sobre Yaiki"
          desc="Quiénes somos y cómo trabajamos"
          onPress={() => router.push('/nosotros')}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  scroll: { padding: Spacing.md, paddingTop: Spacing.lg },
  profileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.goldOverlay,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: Colors.primary, fontSize: 24, fontWeight: '800' },
  profileName: { color: Colors.textPrimary, fontSize: 19, fontWeight: '800' },
  profileEmail: { color: Colors.textSecondary, fontSize: 13 },
  logoutBtn: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: BorderRadius.full,
  },
  authHead: { alignItems: 'center', marginBottom: Spacing.lg, gap: 6 },
  authLogo: { color: Colors.primary, fontSize: 30, fontWeight: '900', letterSpacing: 4 },
  authTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  authSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: Spacing.md,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.full,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.full, alignItems: 'center' },
  switchBtnActive: { backgroundColor: Colors.primary },
  switchText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  switchTextActive: { color: Colors.black },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    color: Colors.textPrimary,
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  errorText: { color: Colors.error, fontSize: 13, marginBottom: Spacing.sm },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: Colors.black, fontSize: 16, fontWeight: '800' },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionHint: { color: Colors.textMuted, fontSize: 12, marginBottom: Spacing.sm, lineHeight: 17 },
  chipRow: { gap: Spacing.sm, paddingBottom: 4 },
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.goldOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  menuDesc: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
});

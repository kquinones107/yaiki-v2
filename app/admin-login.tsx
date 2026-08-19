// =============================================
// ADMIN LOGIN — Pantalla secreta de acceso admin
// Solo accesible con 5 taps en el logo
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa email y contraseña.');
      return;
    }
    clearError();
    const success = await login(email.trim(), password);
    if (success) {
      router.replace('/admin');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* CLOSE */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* LOGO ADMIN */}
        <View style={styles.logoContainer}>
          <Text style={styles.lockIcon}>🔐</Text>
          <Text style={styles.logoText}>✦ YAIKI</Text>
          <Text style={styles.subtitle}>Panel Administrativo</Text>
        </View>

        {/* ERROR */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* FORM */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.loginBtnText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Acceso restringido solo para administradores autorizados.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: Spacing.md,
    zIndex: 10,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xxl },
  lockIcon: { fontSize: 48, marginBottom: Spacing.md },
  logoText: { fontSize: 32, fontWeight: '900', color: Colors.adminAccent, letterSpacing: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: Spacing.xs, letterSpacing: 1 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.3)',
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },
  form: { gap: Spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 15, paddingVertical: 16 },
  eyeBtn: { padding: Spacing.xs },
  loginBtn: {
    backgroundColor: Colors.adminAccent,
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  loginBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.xl,
    lineHeight: 18,
  },
});

// =============================================
// TOAST CONFIG — Configuración visual de notificaciones Toast
// =============================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const toastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => (
    <View style={[styles.toast, styles.successToast]}>
      <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
      <View style={styles.content}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: BaseToastProps) => (
    <View style={[styles.toast, styles.errorToast]}>
      <Ionicons name="alert-circle" size={22} color={Colors.error} />
      <View style={styles.content}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: BaseToastProps) => (
    <View style={[styles.toast, styles.infoToast]}>
      <Ionicons name="information-circle" size={22} color={Colors.primary} />
      <View style={styles.content}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    width: '90%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  successToast: { borderColor: Colors.success },
  errorToast: { borderColor: Colors.error },
  infoToast: { borderColor: Colors.primary },
  content: { marginLeft: Spacing.sm, flex: 1 },
  text1: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
  text2: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});

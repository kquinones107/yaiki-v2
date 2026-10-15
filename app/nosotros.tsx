// =============================================
// NOSOTROS SCREEN — Información de la marca
// =============================================
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const INFO_ITEMS = [
  { icon: 'diamond-outline' as const, title: 'Accesorios Artesanales', desc: 'Cada pieza está hecha a mano con materiales de calidad y mucho amor.' },
  { icon: 'heart-outline' as const, title: 'Diseños Únicos', desc: 'Pulseras, anillos, collares y aretes que expresan tu personalidad.' },
  { icon: 'star-outline' as const, title: 'Colecciones para Ti', desc: 'Desde accesorios para la playa hasta diseños personalizados especiales.' },
];

export default function NosotrosScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Sobre Yaiki</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.heroLogo}>✦ YAIKI</Text>
        <Text style={styles.heroTagline}>Accesorios que cuentan tu historia</Text>
      </View>

      {/* INFO CARDS */}
      <View style={styles.section}>
        {INFO_ITEMS.map((item, i) => (
          <View key={i} style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name={item.icon} size={26} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{item.title}</Text>
              <Text style={styles.infoDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CONTACTO */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contáctanos</Text>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: '#25D366' }]}
          onPress={() => Linking.openURL('https://wa.me/+573187887223')}
        >
          <Ionicons name="logo-whatsapp" size={22} color={Colors.black} />
          <Text style={styles.contactBtnText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: '#C13584' }]}
          onPress={() => Linking.openURL('https://www.instagram.com/yaiki_accesories')}
        >
          <Ionicons name="logo-instagram" size={22} color={Colors.white} />
          <Text style={[styles.contactBtnText, { color: Colors.white }]}>Instagram</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: '#3B5998' }]}
          onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=100091678115327')}
        >
          <Ionicons name="logo-facebook" size={22} color={Colors.white} />
          <Text style={[styles.contactBtnText, { color: Colors.white }]}>Facebook</Text>
        </TouchableOpacity>
      </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBarTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '700' },
  backBtn: { padding: 4 },
  hero: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heroLogo: { fontSize: 36, fontWeight: '900', color: Colors.primary, letterSpacing: 4 },
  heroTagline: { color: Colors.textSecondary, fontSize: 15, marginTop: Spacing.sm, fontStyle: 'italic' },
  section: { padding: Spacing.md, gap: Spacing.sm, marginTop: Spacing.md },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  infoIcon: {
    backgroundColor: Colors.goldOverlay,
    borderRadius: BorderRadius.md,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: { flex: 1 },
  infoTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  infoDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  contactSection: { padding: Spacing.md, marginTop: Spacing.md, gap: Spacing.sm },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  contactBtnText: { fontSize: 15, fontWeight: '700', color: Colors.black },
});

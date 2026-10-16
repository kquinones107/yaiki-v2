// =============================================
// MIS DISEÑOS — Pulseras personalizadas guardadas
// =============================================
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import BraceletPreview from '@/components/BraceletPreview';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useProfileStore } from '@/store/profileStore';
import { useCartStore } from '@/store/cartStore';
import { BraceletDesign } from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

export default function MisDisenosScreen() {
  const { designs, removeDesign } = useProfileStore();
  const addCustomDesign = useCartStore((s) => s.addCustomDesign);

  const handleDelete = (design: BraceletDesign) => {
    Alert.alert('Eliminar diseño', `¿Quitar "${design.name}" de tus diseños?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          removeDesign(design.id);
          Toast.show({ type: 'success', text1: 'Diseño eliminado' });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis diseños</Text>
        <View style={{ width: 32 }} />
      </View>

      {designs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📿</Text>
          <Text style={styles.emptyTitle}>Aún no guardas diseños</Text>
          <Text style={styles.emptyText}>
            Arma tu pulsera pieza por pieza y guárdala para pedirla cuando quieras.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(tabs)/crear')}>
            <Text style={styles.primaryBtnText}>Crear mi pulsera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={designs}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.designName}>{item.name}</Text>
                  <Text style={styles.designMeta}>
                    {item.wristSize} cm · {item.beads.length} piezas
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>

              <BraceletPreview beads={item.beads} scale={0.8} />

              <View style={styles.cardFoot}>
                <Text style={styles.price}>{money(item.totalPrice)} COP</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    addCustomDesign(item);
                    Toast.show({
                      type: 'success',
                      text1: '¡En el carrito!',
                      text2: item.name,
                    });
                  }}
                >
                  <Ionicons name="bag-add-outline" size={18} color={Colors.black} />
                  <Text style={styles.addBtnText}>Pedir de nuevo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
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
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start' },
  designName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  designMeta: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 4 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: Colors.primary, fontSize: 16, fontWeight: '800' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  addBtnText: { color: Colors.black, fontSize: 13, fontWeight: '800' },
});

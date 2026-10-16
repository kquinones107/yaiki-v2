// =============================================
// FAVORITOS — Piezas guardadas por la clienta
// =============================================
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ProductImage from '@/components/ProductImage';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useProfileStore } from '@/store/profileStore';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

export default function FavoritosScreen() {
  const { favorites, toggleFavorite } = useProfileStore();
  const addItem = useCartStore((s) => s.addItem);

  const handleRemove = (product: Product) => {
    toggleFavorite(product);
    Toast.show({ type: 'success', text1: 'Quitado de favoritos' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis favoritos</Text>
        <View style={{ width: 32 }} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>💛</Text>
          <Text style={styles.emptyTitle}>Sin favoritos todavía</Text>
          <Text style={styles.emptyText}>
            Toca el corazón en cualquier pieza del catálogo para guardarla aquí.
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
          data={favorites}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardMain}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
                activeOpacity={0.85}
              >
                <ProductImage product={item} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.category}>{item.categoryName}</Text>
                  <Text style={styles.price}>{money(item.price)} COP</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleRemove(item)} style={styles.actionBtn}>
                  <Ionicons name="heart-dislike-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    addItem(item);
                    Toast.show({ type: 'success', text1: '¡Agregado al carrito!', text2: item.name });
                  }}
                >
                  <Ionicons name="bag-add-outline" size={18} color={Colors.black} />
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
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardMain: { flex: 1, flexDirection: 'row' },
  image: { width: 90, height: 100 },
  info: { flex: 1, padding: Spacing.sm, gap: 2 },
  name: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  category: { color: Colors.textMuted, fontSize: 11 },
  price: { color: Colors.primary, fontSize: 14, fontWeight: '800', marginTop: 2 },
  actions: { padding: Spacing.sm, justifyContent: 'space-between', alignItems: 'center' },
  actionBtn: { padding: 4 },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

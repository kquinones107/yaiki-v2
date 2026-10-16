// =============================================
// CATÁLOGO SCREEN — Todos los productos por categoría
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, ScrollView, useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getProducts, getCategories } from '@/services/productService';
import { useCartStore } from '@/store/cartStore';
import ProductImage from '@/components/ProductImage';
import { Product } from '@/types';
import Toast from 'react-native-toast-message';

function ProductGridCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  return (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      activeOpacity={0.85}
    >
      <ProductImage
        product={product}
        style={styles.gridImage}
        resizeMode="cover"
      />
      {product.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>★</Text>
        </View>
      )}
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.gridBottom}>
          <Text style={styles.gridPrice}>${product.price.toLocaleString('es-CO')}</Text>
          <TouchableOpacity
            style={styles.gridAddBtn}
            onPress={() => {
              addItem(product);
              Toast.show({ type: 'success', text1: '¡Agregado!', text2: product.name, visibilityTime: 1500 });
            }}
          >
            <Ionicons name="add" size={16} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/** Ancho objetivo de cada tarjeta; de ahí salen las columnas */
const CARD_TARGET_WIDTH = 200;

export default function CatalogoScreen() {
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const columns = Math.max(2, Math.min(4, Math.floor(width / CARD_TARGET_WIDTH)));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    (params.categoryId as string) || 'all'
  );
  const [search, setSearch] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategoryId],
    queryFn: () =>
      selectedCategoryId === 'all' ? getProducts() : getProducts(selectedCategoryId),
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catálogo</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar accesorios..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTROS DE CATEGORÍA */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategoryId === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategoryId('all')}
          >
            <Text style={[styles.filterText, selectedCategoryId === 'all' && styles.filterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterChip, selectedCategoryId === cat.id && styles.filterChipActive]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[styles.filterText, selectedCategoryId === cat.id && styles.filterTextActive]}>
                {cat.emoji} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* GRID DE PRODUCTOS */}
      {isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>
            {search ? 'Sin resultados para tu búsqueda' : 'No hay productos en esta categoría aún'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          // En iPad (o ventana ancha) las tarjetas no se estiran: caben más columnas
          key={`cols-${columns}`}
          keyExtractor={(p) => p.id}
          numColumns={columns}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductGridCard product={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 54, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  filtersWrap: { marginVertical: Spacing.sm },
  filters: { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  filterChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: Colors.black },
  grid: { padding: Spacing.md, paddingTop: Spacing.sm },
  columnWrapper: { gap: Spacing.sm, marginBottom: Spacing.sm },
  gridCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridImage: { width: '100%', height: 160 },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredText: { color: Colors.black, fontSize: 12 },
  gridInfo: { padding: Spacing.sm },
  gridName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  gridBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridPrice: { color: Colors.primary, fontSize: 15, fontWeight: '800' },
  gridAddBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
  loadingText: { color: Colors.textSecondary, fontSize: 16 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center' },
});

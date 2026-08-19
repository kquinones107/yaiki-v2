// =============================================
// ADMIN LIST PRODUCTS — Gestión e inventario de productos
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Alert, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getAllProductsAdmin, deleteProduct, updateProduct } from '@/services/productService';
import { Product } from '@/types';
import Toast from 'react-native-toast-message';

function AdminProductRow({ product }: { product: Product }) {
  const queryClient = useQueryClient();

  const toggleAvailabilityMutation = useMutation({
    mutationFn: () => updateProduct(product.id, { isAvailable: !product.isAvailable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_products'] });
      Toast.show({
        type: 'info',
        text1: product.isAvailable ? 'Producto Ocultado' : 'Producto Visible',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(product.id, product.images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_products'] });
      Toast.show({ type: 'success', text1: 'Producto eliminado' });
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  return (
    <View style={[styles.row, !product.isAvailable && styles.rowDisabled]}>
      <Image
        source={{ uri: product.images[0] || 'https://via.placeholder.com/80' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.category}>{product.categoryName}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toLocaleString('es-CO')}</Text>
          <Text style={[styles.stock, product.stock === 0 && { color: Colors.error }]}>
            Stock: {product.stock}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => toggleAvailabilityMutation.mutate()}
        >
          <Ionicons
            name={product.isAvailable ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={product.isAvailable ? Colors.success : Colors.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={() => router.push({ pathname: '/admin/products/[id]', params: { id: product.id } })}
        >
          <Ionicons name="create-outline" size={20} color={Colors.adminLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminProductsListScreen() {
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['admin_products'],
    queryFn: getAllProductsAdmin,
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Productos</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/admin/products/nuevo')}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o categoría..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* LIST */}
      {isLoading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No hay productos para mostrar.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <AdminProductRow product={item} />}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
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
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.adminAccent,
    borderRadius: BorderRadius.full,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrap: { padding: Spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, paddingVertical: 12, marginLeft: Spacing.sm },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  rowDisabled: { opacity: 0.5 },
  image: { width: 64, height: 64, borderRadius: BorderRadius.md },
  info: { flex: 1, marginLeft: Spacing.md },
  name: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  category: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  priceRow: { flexDirection: 'row', gap: 12, marginTop: 4, alignItems: 'center' },
  price: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  stock: { fontSize: 12, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: 4 },
  actionIconBtn: { padding: 6 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textSecondary },
  emptyText: { color: Colors.textMuted },
});

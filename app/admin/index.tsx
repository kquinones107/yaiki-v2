// =============================================
// ADMIN DASHBOARD — Panel de control del Administrador
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import {
  getAllProductsAdmin, getAllCategories, seedFirestoreCatalog,
} from '@/services/productService';
import { getAllOrders } from '@/services/orderService';
import Toast from 'react-native-toast-message';

export default function AdminDashboardScreen() {
  const { admin, logout } = useAuthStore();

  const { data: products = [] } = useQuery({
    queryKey: ['admin_products'],
    queryFn: getAllProductsAdmin,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: getAllCategories,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: getAllOrders,
  });

  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  // Copia el catálogo base a Firestore para poder editarlo aquí
  const handleSeedCatalog = () => {
    Alert.alert(
      'Cargar catálogo base',
      'Se agregan las categorías y productos de ejemplo a Firestore para que los edites (precios, fotos, stock). No se duplican si ya existen.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cargar',
          onPress: async () => {
            setSeeding(true);
            try {
              const result = await seedFirestoreCatalog();
              queryClient.invalidateQueries();
              Toast.show({
                type: 'success',
                text1: 'Catálogo base cargado',
                text2: `${result.products} productos · ${result.categories} categorías`,
              });
            } catch {
              Alert.alert('Error', 'No pudimos cargar el catálogo base.');
            } finally {
              setSeeding(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir del panel de administración?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  const pendingOrders = orders.filter(
    (o) => o.status === 'recibido' || o.status === 'preparacion'
  ).length;
  const availableProducts = products.filter((p) => p.isAvailable).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Panel Administrador</Text>
          <Text style={styles.adminEmail}>{admin?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* STATS CARDS */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={24} color={Colors.adminAccent} />
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Productos Totales</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
          <Text style={styles.statNumber}>{availableProducts}</Text>
          <Text style={styles.statLabel}>Disponibles</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle-outline" size={24} color={Colors.warning} />
          <Text style={styles.statNumber}>{outOfStockProducts}</Text>
          <Text style={styles.statLabel}>Agotados</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="grid-outline" size={24} color={Colors.primary} />
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>Categorías</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={24} color={Colors.info} />
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Pedidos Totales</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color={Colors.warning} />
          <Text style={styles.statNumber}>{pendingOrders}</Text>
          <Text style={styles.statLabel}>Por Despachar</Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/admin/pedidos')}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
            <Ionicons name="receipt-outline" size={24} color={Colors.info} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Pedidos</Text>
            <Text style={styles.actionDesc}>
              {pendingOrders > 0
                ? `${pendingOrders} pedido(s) por despachar`
                : 'Ver pedidos y cambiar su estado'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/admin/products/nuevo')}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.adminAccent} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Agregar Nuevo Producto</Text>
            <Text style={styles.actionDesc}>Sube fotos, define precio, categoría y stock</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/admin/products')}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Gestionar Productos</Text>
            <Text style={styles.actionDesc}>Ver, editar o eliminar productos existentes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/admin/categorias')}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
            <Ionicons name="apps-outline" size={24} color={Colors.success} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Gestionar Categorías</Text>
            <Text style={styles.actionDesc}>Crear o modificar secciones del catálogo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleSeedCatalog}
          disabled={seeding}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
            <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>
              {seeding ? 'Cargando…' : 'Cargar Catálogo Base'}
            </Text>
            <Text style={styles.actionDesc}>
              Trae los productos de ejemplo a Firestore para editarlos aquí
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* VOLVER A LA TIENDA */}
      <TouchableOpacity
        style={styles.storeBtn}
        onPress={() => router.push('/(tabs)')}
      >
        <Ionicons name="storefront-outline" size={20} color={Colors.textPrimary} />
        <Text style={styles.storeBtnText}>Ver Tienda como Cliente</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  welcomeText: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  adminEmail: { fontSize: 13, color: Colors.adminLight, marginTop: 2 },
  logoutBtn: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: BorderRadius.full,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  statNumber: { fontSize: 26, fontWeight: '900', color: Colors.textPrimary, marginVertical: 4 },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  actionDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  storeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  storeBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 14 },
});

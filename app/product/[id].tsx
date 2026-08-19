// =============================================
// PRODUCT DETAIL — Pantalla de detalle de producto
// =============================================
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, FlatList, Linking, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { getProductById } from '@/services/productService';
import { useCartStore } from '@/store/cartStore';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHATSAPP_NUMBER = '+573187887223';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [imageIndex, setImageIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  if (!product || error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Producto no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    Toast.show({ type: 'success', text1: '¡Agregado al carrito!', text2: product.name, visibilityTime: 2000 });
  };

  const handleBuyNow = async () => {
    const msg = `¡Hola! Me interesa este producto:\n\n*${product.name}*\nPrecio: $${product.price.toLocaleString('es-CO')} COP\n\n¿Está disponible?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo abrir WhatsApp.');
    }
  };

  return (
    <View style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGE CAROUSEL */}
        <FlatList
          data={product.images.length > 0 ? product.images : ['https://via.placeholder.com/400']}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onMomentumScrollEnd={(e) => {
            setImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.productImage} resizeMode="cover" />
          )}
        />
        {product.images.length > 1 && (
          <View style={styles.imageDots}>
            {product.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* INFO */}
        <View style={styles.infoContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.categoryName}</Text>
          </View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toLocaleString('es-CO')} COP</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          {/* TAGS */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {product.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* STOCK */}
          <View style={styles.stockRow}>
            <Ionicons
              name={product.stock > 0 ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={product.stock > 0 ? Colors.success : Colors.error}
            />
            <Text style={[styles.stockText, { color: product.stock > 0 ? Colors.success : Colors.error }]}>
              {product.stock > 0 ? `Disponible (${product.stock} unidades)` : 'Sin stock'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart} disabled={product.stock === 0}>
          <Ionicons name="bag-add-outline" size={22} color={Colors.primary} />
          <Text style={styles.cartBtnText}>Agregar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow} disabled={product.stock === 0}>
          <Ionicons name="logo-whatsapp" size={22} color={Colors.black} />
          <Text style={styles.buyBtnText}>Comprar ya</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: { width: SCREEN_WIDTH, height: 380 },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: -24,
    marginBottom: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: Colors.primary, width: 18 },
  infoContainer: { padding: Spacing.md },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.goldOverlay,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  categoryText: { color: Colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginBottom: Spacing.sm, lineHeight: 30 },
  productPrice: { color: Colors.primary, fontSize: 28, fontWeight: '900', marginBottom: Spacing.md },
  productDescription: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24, marginBottom: Spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  tag: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { color: Colors.textSecondary, fontSize: 12 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockText: { fontSize: 14, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    paddingBottom: 32,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cartBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  buyBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#25D366',
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadow.card,
  },
  buyBtnText: { color: Colors.black, fontWeight: '800', fontSize: 15 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { color: Colors.textSecondary, fontSize: 16 },
  errorText: { color: Colors.error, fontSize: 16, marginBottom: Spacing.md },
  backLink: { color: Colors.primary, fontSize: 15 },
});

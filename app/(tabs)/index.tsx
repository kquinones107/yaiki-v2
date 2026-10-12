// =============================================
// HOME SCREEN — Pantalla principal (clientes)
// Con trigger secreto de 5 taps para admin
// =============================================
import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, FlatList, Linking, Dimensions, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, ADMIN_TAP_COUNT } from '@/constants/theme';
import { getFeaturedProducts, getCategories } from '@/services/productService';
import { Category, Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- HERO CAROUSEL ---
const HERO_IMAGES = [
  { source: require('@/assets/images/hero-anillos.jpg'), title: 'Nueva Colección' },
  { source: require('@/assets/images/hero-pulseras.jpg'), title: 'Pulseras Artesanales' },
  { source: require('@/assets/images/hero-personalizadas.jpg'), title: 'Diseños Únicos' },
];

function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % HERO_IMAGES.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={styles.heroContainer}>
      <FlatList
        ref={flatListRef}
        data={HERO_IMAGES}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.heroSlide}>
            <Image source={item.source} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroSubtitle}>YAIKI ACCESORIOS</Text>
              <Text style={styles.heroTitle}>{item.title}</Text>
            </View>
          </View>
        )}
      />
      {/* Indicadores */}
      <View style={styles.heroDots}>
        {HERO_IMAGES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

// --- CATEGORY CHIP ---
function CategoryCard({ category }: { category: Category }) {
  return (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push({ pathname: '/(tabs)/catalogo', params: { categoryId: category.id, categoryName: category.name } })}
      activeOpacity={0.8}
    >
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );
}

// --- PRODUCT CARD ---
function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const handleAddToCart = () => {
    addItem(product);
    Toast.show({
      type: 'success',
      text1: '¡Agregado al carrito!',
      text2: product.name,
      visibilityTime: 2000,
    });
  };
  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: product.images[0] || 'https://via.placeholder.com/200' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>${product.price.toLocaleString('es-CO')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Ionicons name="add" size={18} color={Colors.black} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// --- MAIN HOME ---
export default function HomeScreen() {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoScale = useRef(new Animated.Value(1)).current;

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: featured = [] } = useQuery({
    queryKey: ['featured'],
    queryFn: getFeaturedProducts,
  });

  // TRIGGER SECRETO — 5 taps en logo
  const handleLogoTap = useCallback(() => {
    tapCount.current += 1;

    // Animación de pulso en cada tap
    Animated.sequence([
      Animated.timing(logoScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);

    if (tapCount.current >= ADMIN_TAP_COUNT) {
      tapCount.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);
      router.push('/admin-login');
    }
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogoTap} activeOpacity={1}>
          <Animated.Text style={[styles.logo, { transform: [{ scale: logoScale }] }]}>
            ✦ YAIKI
          </Animated.Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/carrito')}>
          <Ionicons name="bag-outline" size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* CATEGORÍAS */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colecciones</Text>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingLeft: Spacing.md }}
            renderItem={({ item }) => <CategoryCard category={item} />}
          />
        </View>
      )}

      {/* PRODUCTOS DESTACADOS */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destacados</Text>
          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ paddingLeft: Spacing.md }}
            renderItem={({ item }) => <ProductCard product={item} />}
          />
        </View>
      )}

      {/* PLACEHOLDER cuando no hay datos (primeros usos) */}
      {featured.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💎</Text>
          <Text style={styles.emptyTitle}>Bienvenida a Yaiki</Text>
          <Text style={styles.emptyText}>
            Pronto encontrarás aquí nuestras últimas colecciones de accesorios artesanales.
          </Text>
          <TouchableOpacity
            style={styles.exploreBt}
            onPress={() => router.push('/(tabs)/catalogo')}
          >
            <Text style={styles.exploreBtText}>Ver Catálogo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REDES SOCIALES */}
      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>Síguenos</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Linking.openURL('https://www.instagram.com/yaiki_accesories')}
          >
            <Ionicons name="logo-instagram" size={24} color="#C13584" />
            <Text style={styles.socialLabel}>Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=100091678115327')}
          >
            <Ionicons name="logo-facebook" size={24} color="#3B5998" />
            <Text style={styles.socialLabel}>Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Linking.openURL('https://wa.me/+573187887223')}
          >
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.socialLabel}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 30 }} />
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
    paddingTop: 54,
    paddingBottom: Spacing.sm,
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 3,
  },
  // Hero
  heroContainer: { position: 'relative' },
  heroSlide: { width: SCREEN_WIDTH, height: 280 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  heroSubtitle: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 6,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: { backgroundColor: Colors.primary, width: 18 },
  // Section
  section: { marginTop: Spacing.xl },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  // Categories
  categoryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryEmoji: { fontSize: 28, marginBottom: 6 },
  categoryName: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Products
  productCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    width: 160,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImage: { width: '100%', height: 160 },
  productInfo: { padding: Spacing.sm },
  productName: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  addButton: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  exploreBt: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  exploreBtText: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 1,
  },
  // Social
  socialSection: {
    marginTop: Spacing.xxl,
    padding: Spacing.md,
    alignItems: 'center',
  },
  socialTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  socialRow: { flexDirection: 'row', gap: Spacing.lg },
  socialBtn: { alignItems: 'center', gap: 4 },
  socialLabel: { color: Colors.textMuted, fontSize: 11 },
});

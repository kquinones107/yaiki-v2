// =============================================
// TABS LAYOUT — Navegación inferior del cliente
// =============================================
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';

function TabBarIcon({ name, color, size }: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: ColorValue;
  size: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

function CartTabIcon({ color, size }: { color: ColorValue; size: number }) {
  const totalItems = useCartStore((state) => state.totalItems());
  return (
    <View style={styles.cartIconContainer}>
      <Ionicons name="bag-outline" size={size} color={color} />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalItems > 9 ? '9+' : totalItems}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Espacio reservado para la barra de gestos (iOS) o la navegación del
  // sistema (Android). Mínimo de respiro cuando el dispositivo no reporta inset.
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: TAB_BAR_HEIGHT + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalogo"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="crear"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="color-palette-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color, size }) => (
            <CartTabIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

// Altura del contenido de la barra, sin contar el safe area inferior.
const TAB_BAR_HEIGHT = 58;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111111',
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  cartIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

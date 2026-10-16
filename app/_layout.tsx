// =============================================
// ROOT LAYOUT — Expo Router entry point
// =============================================
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastConfig } from '@/components/ui/ToastConfig';
import AnimatedIntro from '@/components/AnimatedIntro';
import { getFeaturedProducts, getCategories } from '@/services/productService';
import { useProfileStore } from '@/store/profileStore';

// Mantener el splash nativo hasta que AnimatedIntro tome el relevo
SplashScreen.preventAutoHideAsync().catch(() => {});

// Tope de espera para la precarga: sin red no se queda pegado en el intro
const PRELOAD_TIMEOUT_MS = 4000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [appReady, setAppReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const initAuth = useProfileStore((s) => s.initAuth);

  // Sesión anónima para poder guardar pedidos sin pedir cuenta
  useEffect(() => initAuth(), []);

  // Precargar lo que muestra el Home para que aparezca completo tras el intro
  useEffect(() => {
    const preload = Promise.allSettled([
      queryClient.prefetchQuery({ queryKey: ['categories'], queryFn: getCategories }),
      queryClient.prefetchQuery({ queryKey: ['featured'], queryFn: getFeaturedProducts }),
    ]);
    const timeout = new Promise((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT_MS));
    Promise.race([preload, timeout]).finally(() => setAppReady(true));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen name="checkout" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="orders" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="order/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="favoritos" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="mis-disenos" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="nosotros" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="admin-login"
            options={{
              headerShown: false,
              animation: 'fade',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="admin"
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <Toast config={toastConfig} topOffset={insets.top + 8} />
        {showIntro && <AnimatedIntro ready={appReady} onFinish={() => setShowIntro(false)} />}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

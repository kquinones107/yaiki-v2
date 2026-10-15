// =============================================
// ADMIN LAYOUT — Layout protegido para admin
// Verifica sesión activa y redirige si no hay auth
// =============================================
import { Stack, router, Redirect } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/theme';

export default function AdminLayout() {
  const { admin, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.adminAccent} />
      </View>
    );
  }

  if (!admin) {
    return <Redirect href="/admin-login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="products/index" />
      <Stack.Screen name="products/nuevo" />
      <Stack.Screen name="products/[id]" />
      <Stack.Screen name="categorias" />
      <Stack.Screen name="pedidos" />
    </Stack>
  );
}

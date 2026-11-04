import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '../context/AuthContext';

function AppNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inTabs = segments[0] === '(tabs)';
    const inRegister = segments[0] === 'register';
    const inLogin = segments[0] === 'login';

    if (!user && inTabs) {
      router.replace('/login');
    } else if (user && (inLogin || inRegister)) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) return null;

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="login"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="register"
        options={{ title: 'Create Account' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
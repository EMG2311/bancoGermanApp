import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { SesionProvider, useSesion } from '@/auth/SesionContext';
import { configurarPresentacion } from '@/notificaciones/push';
import { colores } from '@/theme';

configurarPresentacion();

export default function RootLayout() {
  return (
    <SesionProvider>
      <StatusBar style="dark" />
      <Navegacion />
    </SesionProvider>
  );
}

function Navegacion() {
  const { cargando, sesion } = useSesion();

  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.fondo }}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colores.fondo } }}>
      <Stack.Protected guard={!!sesion}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!sesion}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
    </Stack>
  );
}

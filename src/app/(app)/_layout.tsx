import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { useEffect, useRef } from 'react';

import { pedirRefresco } from '@/lib/eventos';
import { colores } from '@/theme';

export default function AppLayout() {
  useNotificaciones();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerShadowVisible: false,
        headerTintColor: colores.primario,
        headerTitleStyle: { color: colores.texto },
        contentStyle: { backgroundColor: colores.fondo },
      }}>
      <Stack.Screen name="index" options={{ title: 'Deudas' }} />
      <Stack.Screen name="relacion/[id]" options={{ title: '' }} />
      <Stack.Screen name="nuevo-deudor" options={{ title: 'Nuevo deudor', presentation: 'modal' }} />
    </Stack>
  );
}

/**
 * - Push recibido con la app abierta → refresca las pantallas visibles.
 * - Tocar un push (con la app abierta, en segundo plano o cerrada) → abre la relación.
 */
function useNotificaciones() {
  const ultimaRespuesta = Notifications.useLastNotificationResponse();
  const yaAbierta = useRef<string | null>(null);

  useEffect(() => {
    const suscripcion = Notifications.addNotificationReceivedListener(() => pedirRefresco());
    return () => suscripcion.remove();
  }, []);

  useEffect(() => {
    if (!ultimaRespuesta) {
      return;
    }
    const id = ultimaRespuesta.notification.request.identifier;
    if (yaAbierta.current === id) {
      return;
    }
    yaAbierta.current = id;
    const relacionId = ultimaRespuesta.notification.request.content.data?.relacionId;
    if (relacionId) {
      router.push({ pathname: '/relacion/[id]', params: { id: String(relacionId) } });
    }
  }, [ultimaRespuesta]);
}

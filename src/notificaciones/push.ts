import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { api } from '@/api/client';
import { CANAL_NOTIFICACIONES } from '@/config';

const CLAVE_DISPOSITIVO = 'dispositivoId';

export type EstadoPermiso = 'concedido' | 'denegado' | 'sin-preguntar';

export type ResultadoActivacion = { ok: true } | { ok: false; motivo: string; irAAjustes?: boolean };

/** Cómo se muestra un push que llega con la app abierta. */
export function configurarPresentacion() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function estadoPermiso(): Promise<EstadoPermiso> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status === 'granted') {
    return 'concedido';
  }
  return status === 'denied' && !canAskAgain ? 'denegado' : 'sin-preguntar';
}

export async function dispositivoRegistrado(): Promise<boolean> {
  return (await SecureStore.getItemAsync(CLAVE_DISPOSITIVO)) !== null;
}

/**
 * Lo dispara el botón "Activar notificaciones": pide permiso al sistema, obtiene el token de
 * Expo y lo registra en el backend para que los push de este usuario lleguen a este teléfono.
 */
export async function activarNotificaciones(): Promise<ResultadoActivacion> {
  if (Platform.OS === 'android') {
    // En Android 13+ el diálogo de permiso aparece recién cuando existe un canal
    await Notifications.setNotificationChannelAsync(CANAL_NOTIFICACIONES, {
      name: 'Pagos y cobros',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0F766E',
    });
  }

  let { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && canAskAgain) {
    ({ status, canAskAgain } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') {
    return {
      ok: false,
      motivo: 'No diste permiso para notificaciones. Podés habilitarlo desde los ajustes del teléfono.',
      irAAjustes: !canAskAgain,
    };
  }

  return registrarToken();
}

/** Al iniciar sesión: si el permiso ya estaba dado, re-registra el token en silencio (puede haber cambiado). */
export async function sincronizarTokenSiHayPermiso(): Promise<void> {
  if ((await estadoPermiso()) === 'concedido') {
    await registrarToken();
  }
}

/** Al cerrar sesión el teléfono deja de recibir los push de esa cuenta. */
export async function desregistrarDispositivo(): Promise<void> {
  const id = await SecureStore.getItemAsync(CLAVE_DISPOSITIVO);
  await SecureStore.deleteItemAsync(CLAVE_DISPOSITIVO);
  if (id) {
    try {
      await api.eliminarDispositivo(Number(id));
    } catch {
      // Si falla (sin conexión, ya borrado) no bloqueamos el logout
    }
  }
}

async function registrarToken(): Promise<ResultadoActivacion> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    return {
      ok: false,
      motivo: 'Falta vincular la app con EAS (npx eas-cli@latest init). Mirá el README de la app.',
    };
  }
  try {
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    const dispositivo = await api.registrarDispositivo(pushToken, Platform.OS === 'ios' ? 'IOS' : 'ANDROID');
    await SecureStore.setItemAsync(CLAVE_DISPOSITIVO, String(dispositivo.id));
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: `No se pudo obtener el token de notificaciones: ${(e as Error).message}` };
  }
}

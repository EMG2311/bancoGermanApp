/**
 * URL del backend. En el celular "localhost" es el propio teléfono, así que en desarrollo
 * va la IP de la PC en la red Wi-Fi (se configura en .env.local → EXPO_PUBLIC_API_URL).
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.46:8080').replace(/\/$/, '');

/** Canal de Android por el que llegan los push. Tiene que coincidir con el que manda el backend. */
export const CANAL_NOTIFICACIONES = 'movimientos';

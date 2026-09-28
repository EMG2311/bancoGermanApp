import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { configurarApi } from '@/api/client';
import type { Sesion } from '@/api/types';
import { desregistrarDispositivo, sincronizarTokenSiHayPermiso } from '@/notificaciones/push';

const CLAVE_SESION = 'sesion';

interface ValorSesion {
  cargando: boolean;
  sesion: Sesion | null;
  iniciarSesion: (sesion: Sesion) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const SesionContext = createContext<ValorSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<Sesion | null>(null);

  const olvidarSesion = useCallback(async () => {
    await SecureStore.deleteItemAsync(CLAVE_SESION);
    configurarApi({ token: null, alExpirarSesion: () => {} });
    setSesion(null);
  }, []);

  const aplicar = useCallback(
    (nueva: Sesion) => {
      configurarApi({ token: nueva.token, alExpirarSesion: () => void olvidarSesion() });
      setSesion(nueva);
    },
    [olvidarSesion],
  );

  // Al abrir la app: recuperar la sesión guardada si no expiró
  useEffect(() => {
    (async () => {
      try {
        const guardada = await SecureStore.getItemAsync(CLAVE_SESION);
        if (guardada) {
          const s = JSON.parse(guardada) as Sesion;
          if (new Date(s.expiraEn).getTime() > Date.now()) {
            aplicar(s);
            void sincronizarTokenSiHayPermiso();
          } else {
            await SecureStore.deleteItemAsync(CLAVE_SESION);
          }
        }
      } finally {
        setCargando(false);
      }
    })();
  }, [aplicar]);

  const iniciarSesion = useCallback(
    async (nueva: Sesion) => {
      await SecureStore.setItemAsync(CLAVE_SESION, JSON.stringify(nueva));
      aplicar(nueva);
      void sincronizarTokenSiHayPermiso();
    },
    [aplicar],
  );

  const cerrarSesion = useCallback(async () => {
    await desregistrarDispositivo();
    await olvidarSesion();
  }, [olvidarSesion]);

  const valor = useMemo(
    () => ({ cargando, sesion, iniciarSesion, cerrarSesion }),
    [cargando, sesion, iniciarSesion, cerrarSesion],
  );
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion(): ValorSesion {
  const valor = useContext(SesionContext);
  if (!valor) {
    throw new Error('useSesion tiene que usarse dentro de SesionProvider');
  }
  return valor;
}

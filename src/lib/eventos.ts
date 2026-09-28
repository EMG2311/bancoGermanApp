import { useEffect } from 'react';

type Oyente = () => void;
const oyentes = new Set<Oyente>();

/** Avisa a las pantallas abiertas que cambiaron datos en el servidor (ej. llegó un push). */
export function pedirRefresco() {
  oyentes.forEach((o) => o());
}

/** El callback tiene que ser estable (useCallback) para no re-suscribirse en cada render. */
export function useAlPedirRefresco(callback: Oyente) {
  useEffect(() => {
    oyentes.add(callback);
    return () => {
      oyentes.delete(callback);
    };
  }, [callback]);
}

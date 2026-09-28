import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text } from 'react-native';

import { api } from '@/api/client';
import type { Movimiento, Relacion, Solicitud } from '@/api/types';
import { estilosRelacion } from '@/components/relacion/comun';
import { VistaAcreedor } from '@/components/relacion/VistaAcreedor';
import { VistaDeudor } from '@/components/relacion/VistaDeudor';
import { useAlPedirRefresco } from '@/lib/eventos';
import { colores } from '@/theme';

interface Datos {
  relacion: Relacion;
  movimientos: Movimiento[];
  pendientes: Movimiento[];
  solicitudes: Solicitud[];
}

export default function DetalleRelacion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const relacionId = Number(id);
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const relacion = await api.relacion(relacionId);
      if (relacion.miRol === 'ACREEDOR') {
        const [movimientos, pendientes] = await Promise.all([
          api.movimientos(relacionId),
          api.movimientos(relacionId, 'PENDIENTE'),
        ]);
        setDatos({ relacion, movimientos: movimientos.contenido, pendientes: pendientes.contenido, solicitudes: [] });
      } else {
        const solicitudes = await api.solicitudes(relacionId, 'PENDIENTE');
        setDatos({ relacion, movimientos: [], pendientes: [], solicitudes });
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [relacionId]);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );
  useAlPedirRefresco(cargar);

  const refrescar = async () => {
    setRefrescando(true);
    await cargar();
    setRefrescando(false);
  };

  const titulo = datos
    ? datos.relacion.miRol === 'ACREEDOR'
      ? 'Deudor'
      : 'Banco'
    : '';

  return (
    <>
      <Stack.Screen options={{ title: titulo }} />
      <ScrollView
        contentContainerStyle={estilosRelacion.contenido}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}>
        {error ? <Text style={{ color: colores.peligro }}>{error}</Text> : null}
        {!datos && !error ? <ActivityIndicator color={colores.primario} style={{ marginTop: 48 }} /> : null}
        {datos?.relacion.miRol === 'ACREEDOR' ? (
          <VistaAcreedor
            relacion={datos.relacion}
            movimientos={datos.movimientos}
            pendientes={datos.pendientes}
            recargar={cargar}
          />
        ) : null}
        {datos?.relacion.miRol === 'DEUDOR' ? (
          <VistaDeudor relacion={datos.relacion} solicitudes={datos.solicitudes} recargar={cargar} />
        ) : null}
      </ScrollView>
    </>
  );
}

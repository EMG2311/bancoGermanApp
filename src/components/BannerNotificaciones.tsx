import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import {
  activarNotificaciones,
  dispositivoRegistrado,
  estadoPermiso,
  type EstadoPermiso,
} from '@/notificaciones/push';
import { colores, espacio, radio } from '@/theme';
import { Boton } from './Boton';

/**
 * Aparece mientras este teléfono no esté recibiendo push. El botón dispara el diálogo de
 * permiso del sistema y registra el token en el backend.
 */
export function BannerNotificaciones() {
  const [estado, setEstado] = useState<EstadoPermiso | null>(null);
  const [registrado, setRegistrado] = useState(true);
  const [activando, setActivando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revisar = useCallback(() => {
    void (async () => {
      setEstado(await estadoPermiso());
      setRegistrado(await dispositivoRegistrado());
    })();
  }, []);

  // Se revisa al volver a la pantalla (por si el usuario lo habilitó desde ajustes)
  useFocusEffect(revisar);

  if (estado === null || (estado === 'concedido' && registrado)) {
    return null;
  }

  const activar = async () => {
    setActivando(true);
    setError(null);
    const resultado = await activarNotificaciones();
    setActivando(false);
    if (resultado.ok) {
      revisar();
    } else {
      setError(resultado.motivo);
      setEstado(await estadoPermiso());
    }
  };

  const denegado = estado === 'denegado';
  return (
    <View style={estilos.banner}>
      <Text style={estilos.titulo}>Activá las notificaciones</Text>
      <Text style={estilos.texto}>
        {denegado
          ? 'Las notificaciones están bloqueadas. Habilitalas desde los ajustes del teléfono para enterarte de pagos y cobros.'
          : 'Te avisamos cuando te pagan, te piden un cobro o tenés un pago para confirmar.'}
      </Text>
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      {denegado ? (
        <Boton titulo="Abrir ajustes" chico onPress={() => void Linking.openSettings()} />
      ) : (
        <Boton titulo="Aceptar notificaciones" chico onPress={activar} cargando={activando} />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  banner: {
    backgroundColor: colores.primarioSuave,
    borderRadius: radio.l,
    padding: espacio.l,
    gap: espacio.s,
  },
  titulo: { fontSize: 16, fontWeight: '700', color: colores.primario },
  texto: { fontSize: 14, color: colores.texto },
  error: { fontSize: 13, color: colores.peligro },
});

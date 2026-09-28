import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { api } from '@/api/client';
import type { Relacion } from '@/api/types';
import { useSesion } from '@/auth/SesionContext';
import { BannerNotificaciones } from '@/components/BannerNotificaciones';
import { Boton } from '@/components/Boton';
import { Etiqueta, Tarjeta, TituloSeccion, Vacio } from '@/components/Tarjeta';
import { useAlPedirRefresco } from '@/lib/eventos';
import { formatMonto } from '@/lib/formato';
import { colores, espacio } from '@/theme';

export default function Inicio() {
  const { sesion, cerrarSesion } = useSesion();
  const [relaciones, setRelaciones] = useState<Relacion[] | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setRelaciones(await api.relaciones());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

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

  const deudores = relaciones?.filter((r) => r.miRol === 'ACREEDOR') ?? [];
  const invitaciones = relaciones?.filter((r) => r.miRol === 'DEUDOR' && r.estado === 'INVITADA') ?? [];
  const bancos = relaciones?.filter((r) => r.miRol === 'DEUDOR' && r.estado === 'ACTIVA') ?? [];
  const meDeben = deudores.reduce((total, r) => total + r.saldo, 0);
  const debo = bancos.reduce((total, r) => total + r.saldo, 0);

  const salir = () =>
    Alert.alert('Cerrar sesión', '¿Querés salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => void cerrarSesion() },
    ]);

  return (
    <>
      <Stack.Screen
        options={{ headerRight: () => <Boton titulo="Salir" variante="texto" chico onPress={salir} /> }}
      />
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} />}>
        <Text style={estilos.saludo}>Hola, {sesion?.usuario.nombre.split(' ')[0]}</Text>

        <View style={estilos.resumen}>
          <View style={estilos.resumenItem}>
            <Text style={estilos.resumenEtiqueta}>Te deben</Text>
            <Text style={[estilos.resumenMonto, { color: colores.teDeben }]}>{formatMonto(meDeben)}</Text>
          </View>
          <View style={estilos.resumenItem}>
            <Text style={estilos.resumenEtiqueta}>Debés</Text>
            <Text style={[estilos.resumenMonto, { color: colores.debes }]}>{formatMonto(debo)}</Text>
          </View>
        </View>

        <BannerNotificaciones />

        {error ? <Text style={estilos.error}>{error}</Text> : null}

        {invitaciones.length > 0 ? (
          <>
            <TituloSeccion>Invitaciones</TituloSeccion>
            {invitaciones.map((r) => (
              <Invitacion key={r.id} relacion={r} alResponder={cargar} />
            ))}
          </>
        ) : null}

        <TituloSeccion
          accion={<Boton titulo="+ Nuevo" chico variante="secundario" onPress={() => router.push('/nuevo-deudor')} />}>
          Mis deudores
        </TituloSeccion>
        {relaciones && deudores.length === 0 ? (
          <Vacio texto="Todavía nadie te debe. Agregá un deudor con su email." />
        ) : null}
        {deudores.map((r) => (
          <Tarjeta key={r.id} onPress={() => abrir(r)}>
            <View style={estilos.fila}>
              <Text style={estilos.nombre}>{r.deudor.nombre}</Text>
              <Text style={[estilos.monto, { color: colores.teDeben }]}>{formatMonto(r.saldo)}</Text>
            </View>
            {r.estado === 'INVITADA' ? <Etiqueta texto="Esperando que acepte" tono="info" /> : null}
            {r.pendienteConfirmacion > 0 ? (
              <Etiqueta texto={`${formatMonto(r.pendienteConfirmacion)} para confirmar`} />
            ) : null}
          </Tarjeta>
        ))}

        <TituloSeccion>Mis bancos</TituloSeccion>
        {relaciones && bancos.length === 0 ? <Vacio texto="No le debés a nadie." /> : null}
        {bancos.map((r) => (
          <Tarjeta key={r.id} onPress={() => abrir(r)}>
            <View style={estilos.fila}>
              <Text style={estilos.nombre}>{r.acreedor.nombre}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={estilos.leDebes}>Le debés</Text>
                <Text style={[estilos.monto, { color: colores.debes }]}>{formatMonto(r.saldo)}</Text>
              </View>
            </View>
          </Tarjeta>
        ))}
      </ScrollView>
    </>
  );
}

function abrir(relacion: Relacion) {
  router.push({ pathname: '/relacion/[id]', params: { id: String(relacion.id) } });
}

function Invitacion({ relacion, alResponder }: { relacion: Relacion; alResponder: () => Promise<void> }) {
  const [enviando, setEnviando] = useState<'aceptar' | 'rechazar' | null>(null);

  const responder = async (accion: 'aceptar' | 'rechazar') => {
    setEnviando(accion);
    try {
      await (accion === 'aceptar' ? api.aceptar(relacion.id) : api.rechazar(relacion.id));
      await alResponder();
    } catch (e) {
      Alert.alert('No se pudo responder', (e as Error).message);
    } finally {
      setEnviando(null);
    }
  };

  return (
    <Tarjeta>
      <Text style={estilos.nombre}>{relacion.acreedor.nombre}</Text>
      <Text style={estilos.detalle}>Te quiere agregar como deudor. Si aceptás, va a poder anotarte deudas.</Text>
      <View style={estilos.botones}>
        <Boton
          titulo="Rechazar"
          variante="secundario"
          chico
          style={{ flex: 1 }}
          cargando={enviando === 'rechazar'}
          deshabilitado={enviando !== null}
          onPress={() => void responder('rechazar')}
        />
        <Boton
          titulo="Aceptar"
          chico
          style={{ flex: 1 }}
          cargando={enviando === 'aceptar'}
          deshabilitado={enviando !== null}
          onPress={() => void responder('aceptar')}
        />
      </View>
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.m, paddingBottom: espacio.xl * 2 },
  saludo: { fontSize: 24, fontWeight: '700', color: colores.texto },
  resumen: { flexDirection: 'row', gap: espacio.m },
  resumenItem: {
    flex: 1,
    backgroundColor: colores.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espacio.l,
    gap: espacio.xs,
  },
  resumenEtiqueta: { fontSize: 13, color: colores.textoSecundario },
  resumenMonto: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  error: { color: colores.peligro, fontSize: 14 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espacio.m },
  nombre: { fontSize: 17, fontWeight: '600', color: colores.texto, flexShrink: 1 },
  monto: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  leDebes: { fontSize: 12, color: colores.textoSecundario },
  detalle: { fontSize: 14, color: colores.textoSecundario },
  botones: { flexDirection: 'row', gap: espacio.s },
});

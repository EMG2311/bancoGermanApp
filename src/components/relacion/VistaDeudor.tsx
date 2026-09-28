import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { api } from '@/api/client';
import type { Relacion, Solicitud } from '@/api/types';
import { formatMonto } from '@/lib/formato';
import { colores } from '@/theme';
import { Boton } from '../Boton';
import { ModalMonto } from '../ModalMonto';
import { Etiqueta, Tarjeta, TituloSeccion } from '../Tarjeta';
import { estilosRelacion as e, Saldo } from './comun';

interface Props {
  relacion: Relacion;
  solicitudes: Solicitud[];
  recargar: () => Promise<void>;
}

/** Soy deudor: solo veo a qué banco le debo, cuánto, y puedo pagar. */
export function VistaDeudor({ relacion, solicitudes, recargar }: Props) {
  const [pagando, setPagando] = useState(false);
  const [solicitudAPagar, setSolicitudAPagar] = useState<Solicitud | null>(null);
  const banco = relacion.acreedor.nombre;
  const activa = relacion.estado === 'ACTIVA';

  const avisoConfirmacion = relacion.requiereConfirmacion
    ? `${banco} tiene que confirmar el pago antes de que baje tu deuda.`
    : 'El pago baja tu deuda al instante.';

  const rechazarSolicitud = (s: Solicitud) =>
    Alert.alert('Rechazar pedido', `¿Rechazás el pedido de ${formatMonto(s.monto)}?`, [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.rechazarSolicitud(s.id);
            await recargar();
          } catch (err) {
            Alert.alert('No se pudo rechazar', (err as Error).message);
          }
        },
      },
    ]);

  const eliminar = () =>
    Alert.alert('Eliminar relación', `Ya no le debés nada a ${banco}. ¿Eliminás la relación?`, [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.eliminar(relacion.id);
            router.back();
          } catch (err) {
            Alert.alert('No se pudo eliminar', (err as Error).message);
          }
        },
      },
    ]);

  return (
    <>
      <Tarjeta>
        <Text style={e.etiquetaSaldo}>Banco</Text>
        <Text style={e.nombre}>{banco}</Text>
        <Saldo etiqueta="Le debés" monto={relacion.saldo} color={colores.debes} />
        {relacion.pendienteConfirmacion > 0 ? (
          <Etiqueta texto={`${formatMonto(relacion.pendienteConfirmacion)} esperando que ${banco} confirme`} />
        ) : null}
      </Tarjeta>

      {activa && solicitudes.length > 0 ? (
        <>
          <TituloSeccion>Te pidió que pagues</TituloSeccion>
          {solicitudes.map((s) => (
            <Tarjeta key={s.id}>
              <Text style={e.pendienteMonto}>{formatMonto(s.monto)}</Text>
              {s.descripcion ? <Text style={e.texto}>{s.descripcion}</Text> : null}
              <View style={e.fila}>
                <Boton
                  titulo="Rechazar"
                  variante="secundario"
                  chico
                  style={{ flex: 1 }}
                  onPress={() => rechazarSolicitud(s)}
                />
                <Boton titulo="Pagar" chico style={{ flex: 1 }} onPress={() => setSolicitudAPagar(s)} />
              </View>
            </Tarjeta>
          ))}
        </>
      ) : null}

      {activa ? (
        <Boton
          titulo="Pagar"
          onPress={() => setPagando(true)}
          deshabilitado={relacion.disponibleParaPagar <= 0}
        />
      ) : null}

      {activa && relacion.saldo === 0 ? (
        <Boton titulo="Eliminar relación" variante="texto" onPress={eliminar} />
      ) : null}

      <ModalMonto
        visible={pagando}
        titulo={`Pagarle a ${banco}`}
        ayuda={`Podés pagar hasta ${formatMonto(relacion.disponibleParaPagar)}. ${avisoConfirmacion}`}
        textoConfirmar="Registrar pago"
        conMedio
        conDescripcion
        maximo={relacion.disponibleParaPagar}
        onCerrar={() => setPagando(false)}
        onConfirmar={async ({ monto, medioPago, descripcion }) => {
          await api.pago(relacion.id, monto, medioPago, descripcion);
          await recargar();
        }}
      />
      <ModalMonto
        visible={solicitudAPagar !== null}
        titulo={`Pagarle a ${banco}`}
        ayuda={avisoConfirmacion}
        textoConfirmar="Registrar pago"
        conMedio
        montoFijo={solicitudAPagar?.monto}
        onCerrar={() => setSolicitudAPagar(null)}
        onConfirmar={async ({ medioPago }) => {
          if (solicitudAPagar) {
            await api.pagarSolicitud(solicitudAPagar.id, medioPago);
            await recargar();
          }
        }}
      />
    </>
  );
}

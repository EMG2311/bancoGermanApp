import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';

import { api } from '@/api/client';
import type { Movimiento, Relacion } from '@/api/types';
import { formatFecha, formatMonto } from '@/lib/formato';
import { colores } from '@/theme';
import { Boton } from '../Boton';
import { ModalMonto } from '../ModalMonto';
import { Etiqueta, Tarjeta, TituloSeccion, Vacio } from '../Tarjeta';
import { describirMovimiento, estilosRelacion as e, FilaMovimiento, Saldo } from './comun';

type Accion = 'asignar' | 'pagoRecibido' | 'cobro' | null;

interface Props {
  relacion: Relacion;
  movimientos: Movimiento[];
  pendientes: Movimiento[];
  recargar: () => Promise<void>;
}

/** Soy el banco: le asigno deuda, registro lo que me pagó, confirmo pagos y le pido cobros. */
export function VistaAcreedor({ relacion, movimientos, pendientes, recargar }: Props) {
  const [accion, setAccion] = useState<Accion>(null);
  const [cambiandoFlag, setCambiandoFlag] = useState(false);
  const nombre = relacion.deudor.nombre;
  const activa = relacion.estado === 'ACTIVA';

  const cambiarConfirmacion = async (valor: boolean) => {
    setCambiandoFlag(true);
    try {
      await api.cambiarConfirmacion(relacion.id, valor);
      await recargar();
    } catch (err) {
      Alert.alert('No se pudo cambiar', (err as Error).message);
    } finally {
      setCambiandoFlag(false);
    }
  };

  const eliminar = () => {
    const invitada = relacion.estado === 'INVITADA';
    Alert.alert(
      invitada ? 'Cancelar invitación' : 'Eliminar relación',
      invitada
        ? `${nombre} ya no va a poder aceptarla.`
        : relacion.saldo > 0
          ? `${nombre} todavía te debe ${formatMonto(relacion.saldo)}. Si eliminás la relación, esa deuda queda perdonada.`
          : 'El historial se conserva, pero no vas a poder anotar nada más.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: invitada ? 'Cancelar invitación' : 'Eliminar',
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
      ],
    );
  };

  return (
    <>
      <Tarjeta>
        <Text style={e.nombre}>{nombre}</Text>
        <Text style={e.email}>{relacion.deudor.email}</Text>
        <Saldo etiqueta="Te debe" monto={relacion.saldo} color={colores.teDeben} />
        {relacion.pendienteConfirmacion > 0 ? (
          <Etiqueta texto={`${formatMonto(relacion.pendienteConfirmacion)} en pagos para confirmar`} />
        ) : null}
      </Tarjeta>

      {relacion.estado === 'INVITADA' ? (
        <Tarjeta>
          <Text style={e.texto}>
            Le mandamos la invitación a {nombre}. Cuando la acepte vas a poder asignarle deuda.
          </Text>
        </Tarjeta>
      ) : null}

      {activa ? (
        <View style={e.acciones}>
          <Boton titulo="Asignar deuda" onPress={() => setAccion('asignar')} />
          <View style={e.fila}>
            <Boton
              titulo="Me pagó"
              variante="secundario"
              style={{ flex: 1 }}
              deshabilitado={relacion.disponibleParaPagar <= 0}
              onPress={() => setAccion('pagoRecibido')}
            />
            <Boton
              titulo="Pedir cobro"
              variante="secundario"
              style={{ flex: 1 }}
              deshabilitado={relacion.saldo <= 0}
              onPress={() => setAccion('cobro')}
            />
          </View>
        </View>
      ) : null}

      {pendientes.length > 0 ? (
        <>
          <TituloSeccion>Pagos para confirmar</TituloSeccion>
          {pendientes.map((p) => (
            <PagoPendiente key={p.id} pago={p} recargar={recargar} />
          ))}
        </>
      ) : null}

      {relacion.estado !== 'ELIMINADA' && relacion.estado !== 'RECHAZADA' ? (
        <Tarjeta>
          <View style={e.ajuste}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={e.ajusteTitulo}>Confirmar sus pagos</Text>
              <Text style={e.texto}>
                Si está activo, los pagos que registre {nombre} no bajan la deuda hasta que los confirmes.
              </Text>
            </View>
            <Switch
              value={relacion.requiereConfirmacion}
              onValueChange={(v) => void cambiarConfirmacion(v)}
              disabled={cambiandoFlag}
              trackColor={{ true: colores.primario }}
            />
          </View>
        </Tarjeta>
      ) : null}

      {activa ? (
        <>
          <TituloSeccion>Movimientos</TituloSeccion>
          <Tarjeta style={{ paddingVertical: 0 }}>
            {movimientos.length === 0 ? <Vacio texto="Todavía no hay movimientos." /> : null}
            {movimientos.map((m) => (
              <FilaMovimiento key={m.id} movimiento={m} />
            ))}
          </Tarjeta>
        </>
      ) : null}

      {relacion.estado === 'ACTIVA' || relacion.estado === 'INVITADA' ? (
        <Boton
          titulo={relacion.estado === 'INVITADA' ? 'Cancelar invitación' : 'Eliminar relación'}
          variante="texto"
          onPress={eliminar}
        />
      ) : null}

      <ModalMonto
        visible={accion === 'asignar'}
        titulo={`Asignar deuda a ${nombre}`}
        ayuda="Suma a lo que te debe. No necesita confirmación."
        textoConfirmar="Asignar"
        conDescripcion
        onCerrar={() => setAccion(null)}
        onConfirmar={async ({ monto, descripcion }) => {
          await api.cargo(relacion.id, monto, descripcion);
          await recargar();
        }}
      />
      <ModalMonto
        visible={accion === 'pagoRecibido'}
        titulo={`${nombre} te pagó`}
        ayuda="Registrá un pago que recibiste. Baja la deuda al instante."
        textoConfirmar="Registrar pago"
        conMedio
        conDescripcion
        maximo={relacion.disponibleParaPagar}
        onCerrar={() => setAccion(null)}
        onConfirmar={async ({ monto, medioPago, descripcion }) => {
          await api.pago(relacion.id, monto, medioPago, descripcion);
          await recargar();
        }}
      />
      <ModalMonto
        visible={accion === 'cobro'}
        titulo={`Pedirle a ${nombre}`}
        ayuda="Le llega una notificación para que te transfiera."
        textoConfirmar="Enviar pedido"
        conDescripcion
        montoInicial={relacion.saldo}
        maximo={relacion.saldo}
        onCerrar={() => setAccion(null)}
        onConfirmar={async ({ monto, descripcion }) => {
          await api.pedirCobro(relacion.id, monto, descripcion);
          Alert.alert('Pedido enviado', `${nombre} recibió tu solicitud de cobro.`);
        }}
      />
    </>
  );
}

function PagoPendiente({ pago, recargar }: { pago: Movimiento; recargar: () => Promise<void> }) {
  const [enviando, setEnviando] = useState<'confirmar' | 'rechazar' | null>(null);

  const resolver = async (accion: 'confirmar' | 'rechazar') => {
    setEnviando(accion);
    try {
      await (accion === 'confirmar' ? api.confirmarPago(pago.id) : api.rechazarPago(pago.id));
      await recargar();
    } catch (err) {
      Alert.alert('No se pudo resolver el pago', (err as Error).message);
    } finally {
      setEnviando(null);
    }
  };

  return (
    <Tarjeta>
      <Text style={e.pendienteMonto}>{formatMonto(pago.monto)}</Text>
      <Text style={e.texto}>
        {describirMovimiento(pago)} · {formatFecha(pago.fecha)}
      </Text>
      <View style={e.fila}>
        <Boton
          titulo="Rechazar"
          variante="secundario"
          chico
          style={{ flex: 1 }}
          cargando={enviando === 'rechazar'}
          deshabilitado={enviando !== null}
          onPress={() => void resolver('rechazar')}
        />
        <Boton
          titulo="Confirmar"
          chico
          style={{ flex: 1 }}
          cargando={enviando === 'confirmar'}
          deshabilitado={enviando !== null}
          onPress={() => void resolver('confirmar')}
        />
      </View>
    </Tarjeta>
  );
}

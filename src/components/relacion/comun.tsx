import { StyleSheet, Text, View } from 'react-native';

import type { Movimiento } from '@/api/types';
import { formatFecha, formatMonto } from '@/lib/formato';
import { colores, espacio } from '@/theme';
import { Etiqueta } from '../Tarjeta';

export function Saldo({ etiqueta, monto, color }: { etiqueta: string; monto: number; color: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={estilosRelacion.etiquetaSaldo}>{etiqueta}</Text>
      <Text style={[estilosRelacion.saldo, { color }]}>{formatMonto(monto)}</Text>
    </View>
  );
}

export function describirMovimiento(m: Movimiento): string {
  if (m.tipo === 'CARGO') {
    return m.descripcion || 'Deuda asignada';
  }
  const medio = m.medioPago === 'EFECTIVO' ? 'efectivo' : 'transferencia';
  return m.descripcion ? `${m.descripcion} (${medio})` : `Pago por ${medio}`;
}

export function FilaMovimiento({ movimiento: m }: { movimiento: Movimiento }) {
  const esPago = m.tipo === 'PAGO';
  return (
    <View style={estilosRelacion.movimiento}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={estilosRelacion.movimientoTitulo}>{describirMovimiento(m)}</Text>
        <Text style={estilosRelacion.movimientoFecha}>{formatFecha(m.fecha)}</Text>
        {m.estado === 'PENDIENTE' ? <Etiqueta texto="Por confirmar" /> : null}
        {m.estado === 'RECHAZADO' ? <Etiqueta texto="Rechazado" tono="peligro" /> : null}
      </View>
      <Text
        style={[
          estilosRelacion.movimientoMonto,
          { color: m.estado === 'RECHAZADO' ? colores.textoSecundario : esPago ? colores.teDeben : colores.texto },
          m.estado === 'RECHAZADO' && { textDecorationLine: 'line-through' },
        ]}>
        {esPago ? '−' : '+'} {formatMonto(m.monto)}
      </Text>
    </View>
  );
}

export const estilosRelacion = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.m, paddingBottom: espacio.xl * 2 },
  nombre: { fontSize: 24, fontWeight: '700', color: colores.texto },
  email: { fontSize: 14, color: colores.textoSecundario },
  etiquetaSaldo: { fontSize: 14, color: colores.textoSecundario },
  saldo: { fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] },
  texto: { fontSize: 14, color: colores.textoSecundario },
  acciones: { gap: espacio.s },
  fila: { flexDirection: 'row', gap: espacio.s },
  movimiento: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacio.m,
    paddingVertical: espacio.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colores.borde,
  },
  movimientoTitulo: { fontSize: 15, color: colores.texto },
  movimientoFecha: { fontSize: 12, color: colores.textoSecundario },
  movimientoMonto: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  pendienteMonto: { fontSize: 20, fontWeight: '700', color: colores.texto, fontVariant: ['tabular-nums'] },
  ajuste: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  ajusteTitulo: { fontSize: 16, fontWeight: '600', color: colores.texto },
});

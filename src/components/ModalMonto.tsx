import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MedioPago } from '@/api/types';
import { formatMonto, montoParaInput, parseMonto } from '@/lib/formato';
import { colores, espacio, radio } from '@/theme';
import { Boton } from './Boton';
import { Campo } from './Campo';

export interface DatosMonto {
  monto: number;
  medioPago: MedioPago;
  descripcion?: string;
}

interface Props {
  visible: boolean;
  titulo: string;
  ayuda?: string;
  textoConfirmar: string;
  /** Muestra el selector Transferencia / Efectivo (solo para pagos). */
  conMedio?: boolean;
  conDescripcion?: boolean;
  montoInicial?: number;
  /** Monto fijo que no se puede editar (ej. pagar una solicitud de cobro). */
  montoFijo?: number;
  maximo?: number;
  onConfirmar: (datos: DatosMonto) => Promise<void>;
  onCerrar: () => void;
}

/** Hoja inferior para cualquier acción que necesita un monto: asignar deuda, pagar, pedir cobro. */
export function ModalMonto(props: Props) {
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onCerrar}>
      <Pressable style={estilos.fondo} onPress={props.onCerrar} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Se monta al abrir: cada apertura arranca con el formulario limpio */}
        {props.visible ? <Formulario {...props} /> : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Formulario(props: Props) {
  const { titulo, ayuda, textoConfirmar, conMedio, conDescripcion, montoInicial, montoFijo, maximo } = props;
  const [texto, setTexto] = useState(montoInicial ? montoParaInput(montoInicial) : '');
  const [descripcion, setDescripcion] = useState('');
  const [medio, setMedio] = useState<MedioPago>('TRANSFERENCIA');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const confirmar = async () => {
    const monto = montoFijo ?? parseMonto(texto);
    if (monto === null) {
      setError('Ingresá un monto válido (hasta 2 decimales).');
      return;
    }
    if (maximo !== undefined && monto > maximo) {
      setError(`El máximo es ${formatMonto(maximo)}.`);
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await props.onConfirmar({ monto, medioPago: medio, descripcion: descripcion.trim() || undefined });
      props.onCerrar();
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  };

  return (
    <View style={estilos.hoja}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {ayuda ? <Text style={estilos.ayuda}>{ayuda}</Text> : null}

      {montoFijo !== undefined ? (
        <Text style={estilos.montoFijo}>{formatMonto(montoFijo)}</Text>
      ) : (
        <Campo
          etiqueta="Monto"
          value={texto}
          onChangeText={setTexto}
          keyboardType="decimal-pad"
          placeholder="0,00"
          autoFocus
        />
      )}

      {conMedio ? (
        <View style={estilos.medios}>
          {(['TRANSFERENCIA', 'EFECTIVO'] as const).map((m) => (
            <Pressable
              key={m}
              accessibilityRole="radio"
              accessibilityState={{ selected: medio === m }}
              onPress={() => setMedio(m)}
              style={[estilos.medio, medio === m && estilos.medioActivo]}>
              <Text style={[estilos.medioTexto, medio === m && estilos.medioTextoActivo]}>
                {m === 'TRANSFERENCIA' ? 'Transferencia' : 'Efectivo'}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {conDescripcion ? (
        <Campo
          etiqueta="Detalle (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Ej: préstamo auto"
          maxLength={255}
        />
      ) : null}

      {error ? <Text style={estilos.error}>{error}</Text> : null}

      <Boton titulo={textoConfirmar} onPress={confirmar} cargando={enviando} />
      <Boton titulo="Cancelar" variante="texto" onPress={props.onCerrar} deshabilitado={enviando} />
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  hoja: {
    backgroundColor: colores.fondo,
    borderTopLeftRadius: radio.l,
    borderTopRightRadius: radio.l,
    padding: espacio.xl,
    paddingBottom: espacio.xl * 1.5,
    gap: espacio.m,
  },
  titulo: { fontSize: 20, fontWeight: '700', color: colores.texto },
  ayuda: { fontSize: 14, color: colores.textoSecundario },
  montoFijo: { fontSize: 32, fontWeight: '700', color: colores.texto },
  medios: { flexDirection: 'row', gap: espacio.s },
  medio: {
    flex: 1,
    minHeight: 44,
    borderRadius: radio.m,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medioActivo: { borderColor: colores.primario, backgroundColor: colores.primarioSuave },
  medioTexto: { fontSize: 15, color: colores.texto },
  medioTextoActivo: { color: colores.primario, fontWeight: '700' },
  error: { color: colores.peligro, fontSize: 14 },
});

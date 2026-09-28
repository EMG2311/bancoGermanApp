import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colores, espacio, radio } from '@/theme';

export function Tarjeta({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  if (!onPress) {
    return <View style={[estilos.tarjeta, style]}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada, style]}>
      {children}
    </Pressable>
  );
}

export function TituloSeccion({ children, accion }: { children: string; accion?: ReactNode }) {
  return (
    <View style={estilos.tituloFila}>
      <Text style={estilos.titulo}>{children}</Text>
      {accion}
    </View>
  );
}

export function Etiqueta({ texto, tono = 'aviso' }: { texto: string; tono?: 'aviso' | 'info' | 'peligro' }) {
  const fondo = { aviso: colores.avisoSuave, info: colores.primarioSuave, peligro: colores.peligroSuave }[tono];
  const color = { aviso: colores.aviso, info: colores.primario, peligro: colores.peligro }[tono];
  return (
    <View style={[estilos.etiqueta, { backgroundColor: fondo }]}>
      <Text style={[estilos.etiquetaTexto, { color }]}>{texto}</Text>
    </View>
  );
}

export function Vacio({ texto }: { texto: string }) {
  return <Text style={estilos.vacio}>{texto}</Text>;
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: radio.l,
    padding: espacio.l,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: espacio.s,
  },
  presionada: { backgroundColor: '#F8FAFC' },
  tituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacio.l,
  },
  titulo: { fontSize: 18, fontWeight: '700', color: colores.texto },
  etiqueta: { alignSelf: 'flex-start', paddingHorizontal: espacio.s, paddingVertical: 2, borderRadius: radio.s },
  etiquetaTexto: { fontSize: 12, fontWeight: '600' },
  vacio: { color: colores.textoSecundario, fontSize: 15, paddingVertical: espacio.s },
});

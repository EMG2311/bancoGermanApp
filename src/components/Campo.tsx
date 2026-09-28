import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colores, espacio, radio } from '@/theme';

interface Props extends TextInputProps {
  etiqueta: string;
}

export function Campo({ etiqueta, style, ...props }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput placeholderTextColor={colores.textoSecundario} style={[estilos.input, style]} {...props} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacio.xs },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colores.texto },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.m,
    paddingHorizontal: espacio.m,
    fontSize: 16,
    color: colores.texto,
    backgroundColor: colores.tarjeta,
  },
});

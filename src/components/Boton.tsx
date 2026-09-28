import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colores, espacio, radio } from '@/theme';

type Variante = 'primario' | 'secundario' | 'peligro' | 'texto';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  cargando?: boolean;
  deshabilitado?: boolean;
  chico?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Boton({ titulo, onPress, variante = 'primario', cargando, deshabilitado, chico, style }: Props) {
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.base,
        chico && estilos.chico,
        estilos[variante],
        pressed && estilos.presionado,
        inactivo && estilos.inactivo,
        style,
      ]}>
      {cargando ? (
        <ActivityIndicator color={variante === 'primario' || variante === 'peligro' ? '#fff' : colores.primario} />
      ) : (
        <Text style={[estilos.texto, chico && estilos.textoChico, estilos[`texto_${variante}`]]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radio.m,
    paddingHorizontal: espacio.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chico: { minHeight: 36, paddingHorizontal: espacio.m, borderRadius: radio.s },
  primario: { backgroundColor: colores.primario },
  secundario: { backgroundColor: colores.primarioSuave },
  peligro: { backgroundColor: colores.peligro },
  texto: { backgroundColor: 'transparent' },
  presionado: { opacity: 0.8 },
  inactivo: { opacity: 0.5 },
  textoChico: { fontSize: 14 },
  texto_primario: { color: '#fff', fontSize: 16, fontWeight: '600' },
  texto_secundario: { color: colores.primario, fontSize: 16, fontWeight: '600' },
  texto_peligro: { color: '#fff', fontSize: 16, fontWeight: '600' },
  texto_texto: { color: colores.primario, fontSize: 16, fontWeight: '600' },
});

import { StyleSheet } from 'react-native';

import { colores, espacio } from '@/theme';

/** Estilos compartidos por login y registro. */
export const estilosAuth = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: espacio.xl, gap: espacio.l },
  marca: { gap: espacio.s, marginBottom: espacio.l },
  logo: { fontSize: 36, fontWeight: '800', color: colores.primario },
  subtitulo: { fontSize: 16, color: colores.textoSecundario },
  error: { color: colores.peligro, fontSize: 14 },
  link: { color: colores.primario, fontSize: 15, fontWeight: '600', textAlign: 'center', paddingVertical: espacio.s },
});

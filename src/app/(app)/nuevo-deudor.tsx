import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { api } from '@/api/client';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Tarjeta } from '@/components/Tarjeta';
import { colores, espacio } from '@/theme';

export default function NuevoDeudor() {
  const [email, setEmail] = useState('');
  const [requiereConfirmacion, setRequiereConfirmacion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const invitar = async () => {
    if (!email.trim()) {
      setError('Ingresá el email de la persona.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const relacion = await api.invitar(email.trim(), requiereConfirmacion);
      router.back();
      router.push({ pathname: '/relacion/[id]', params: { id: String(relacion.id) } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Text style={estilos.ayuda}>
          La persona tiene que tener cuenta en la app. Le llega una invitación y, cuando la acepta, vas a poder
          asignarle deuda.
        </Text>

        <Campo
          etiqueta="Email del deudor"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
          placeholder="deudor@mail.com"
        />

        <Tarjeta>
          <View style={estilos.ajuste}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={estilos.ajusteTitulo}>Confirmar sus pagos</Text>
              <Text style={estilos.ayuda}>
                Los pagos que registre no bajan la deuda hasta que vos los confirmes. Lo podés cambiar después.
              </Text>
            </View>
            <Switch
              value={requiereConfirmacion}
              onValueChange={setRequiereConfirmacion}
              trackColor={{ true: colores.primario }}
            />
          </View>
        </Tarjeta>

        {error ? <Text style={estilos.error}>{error}</Text> : null}

        <Boton titulo="Enviar invitación" onPress={invitar} cargando={enviando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacio.l, gap: espacio.l },
  ayuda: { fontSize: 14, color: colores.textoSecundario },
  ajuste: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  ajusteTitulo: { fontSize: 16, fontWeight: '600', color: colores.texto },
  error: { color: colores.peligro, fontSize: 14 },
});

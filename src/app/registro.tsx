import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import { useSesion } from '@/auth/SesionContext';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { estilosAuth as estilos } from '@/components/estilosAuth';

export default function Registro() {
  const { iniciarSesion } = useSesion();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const crearCuenta = async () => {
    if (!nombre.trim() || !email.trim()) {
      setError('Completá nombre y email.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña tiene que tener al menos 8 caracteres.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const sesion = await api.registro({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        password,
      });
      await iniciarSesion(sesion);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.marca}>
            <Text style={estilos.logo}>Crear cuenta</Text>
            <Text style={estilos.subtitulo}>
              Con la misma cuenta podés ser banco de unos y deudor de otros.
            </Text>
          </View>

          <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} autoComplete="name" />
          <Campo
            etiqueta="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Campo
            etiqueta="Teléfono (opcional)"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <Campo
            etiqueta="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
          />

          {error ? <Text style={estilos.error}>{error}</Text> : null}

          <Boton titulo="Crear cuenta" onPress={crearCuenta} cargando={enviando} />
          <Link href="/login" style={estilos.link}>
            Ya tengo cuenta
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

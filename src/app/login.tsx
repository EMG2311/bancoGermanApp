import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import { useSesion } from '@/auth/SesionContext';
import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { estilosAuth as estilos } from '@/components/estilosAuth';

export default function Login() {
  const { iniciarSesion } = useSesion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const ingresar = async () => {
    if (!email.trim() || !password) {
      setError('Completá email y contraseña.');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await iniciarSesion(await api.login(email.trim(), password));
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
            <Text style={estilos.logo}>Deudas</Text>
            <Text style={estilos.subtitulo}>Llevá la cuenta de lo que te deben y de lo que debés.</Text>
          </View>

          <Campo
            etiqueta="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="vos@mail.com"
          />
          <Campo
            etiqueta="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            onSubmitEditing={ingresar}
          />

          {error ? <Text style={estilos.error}>{error}</Text> : null}

          <Boton titulo="Ingresar" onPress={ingresar} cargando={enviando} />
          <Link href="/registro" style={estilos.link}>
            ¿No tenés cuenta? Creá una
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

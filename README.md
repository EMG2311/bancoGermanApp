# App de deudas (Expo / React Native)

Expo SDK 57 · Expo Router · expo-notifications · TypeScript. Backend: `../demo`.

## Pantallas

- **Login / Crear cuenta**
- **Inicio**: cuánto te deben y cuánto debés, botón **Aceptar notificaciones**, invitaciones
  pendientes, **Mis deudores** (tocás uno para asignarle deuda) y **Mis bancos** (a quién le debés y cuánto).
- **Deudor** (sos el banco): asignar deuda, registrar un pago recibido (transferencia/efectivo), pedir cobro,
  confirmar/rechazar pagos, activar "confirmar sus pagos", movimientos, eliminar.
- **Banco** (sos deudor): a quién le debés, cuánto, pagar y responder pedidos de cobro.
- **Nuevo deudor**: invitar por email.

Tocar un push abre directamente la relación a la que se refiere.

## Correr en el celular

Las notificaciones push **no funcionan en Expo Go** (en Android desde el SDK 53), así que hace falta
un *development build*: la app instalada con tus librerías nativas.

### 1. Backend accesible desde el teléfono

- Levantá el backend (`cd ../demo && ./mvnw spring-boot:run`).
- El celular y la PC tienen que estar en la misma red Wi-Fi.
- En `.env.local` poné la IP de tu PC: `EXPO_PUBLIC_API_URL=http://192.168.1.46:8080`.
- Si Windows pregunta por el firewall para Java, permití redes privadas (o abrí el puerto 8080).

### 2. Vincular con Expo (una sola vez; necesario para los push)

```sh
npx eas-cli@latest login      # cuenta gratuita de expo.dev
npx eas-cli@latest init       # agrega extra.eas.projectId a app.json
```

### 3. Credenciales de Android para push (una sola vez)

Expo entrega los push de Android a través de Firebase Cloud Messaging:

1. Creá un proyecto en https://console.firebase.google.com y agregá una app Android con el paquete
   `com.bancogerman.deudas`.
2. Descargá `google-services.json`, dejalo en esta carpeta y agregá en `app.json`, dentro de `android`:
   `"googleServicesFile": "./google-services.json"`.
3. En Firebase: Configuración del proyecto → Cuentas de servicio → **Generar nueva clave privada**.
4. Subila a Expo: `npx eas-cli@latest credentials` → Android → Google Service Account →
   FCM V1 → subir la clave.

(iOS requiere una cuenta paga de Apple Developer.)

### 4. Instalar la app

Con el celular conectado por USB (depuración USB activada) o un emulador con Google Play:

```sh
npm run android        # compila e instala el development build (expo run:android)
```

O en la nube, sin Android Studio: `npx eas-cli@latest build --profile development --platform android`.

Después, para el día a día: `npm start` y abrís la app instalada.

### 5. Probar el push

1. Creá dos cuentas (por ejemplo en dos teléfonos, o una en el teléfono y otra con curl).
2. En el teléfono, tocá **Aceptar notificaciones**.
3. Desde la otra cuenta, invitala como deudora o pedile un cobro: llega el push.

## Scripts

```sh
npm start          # servidor de desarrollo (para el development build)
npm run android    # compilar e instalar en Android
npm run typecheck
npm run lint
```

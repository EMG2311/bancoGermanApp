import { API_URL } from '@/config';
import type {
  Dispositivo,
  EstadoMovimiento,
  EstadoSolicitud,
  MedioPago,
  Movimiento,
  Pagina,
  Plataforma,
  Relacion,
  Sesion,
  Solicitud,
  Usuario,
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

let token: string | null = null;
let alExpirarSesion: (() => void) | null = null;

export function configurarApi(opciones: { token: string | null; alExpirarSesion: () => void }) {
  token = opciones.token;
  alExpirarSesion = opciones.alExpirarSesion;
}

async function pedir<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(API_URL + ruta, {
      method: metodo,
      headers: {
        Accept: 'application/json',
        ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ApiError(`No se pudo conectar con el servidor (${API_URL})`, 0);
  }

  if (respuesta.status === 401 && token) {
    alExpirarSesion?.();
  }
  const texto = await respuesta.text();
  const json = texto ? JSON.parse(texto) : undefined;
  if (!respuesta.ok) {
    throw new ApiError(mensajeDeError(json, respuesta.status), respuesta.status);
  }
  return json as T;
}

/** El backend responde errores como problem+json: { detail, errores?: { campo: mensaje } }. */
function mensajeDeError(json: any, status: number): string {
  const primerErrorDeCampo = json?.errores ? Object.entries(json.errores)[0] : undefined;
  if (primerErrorDeCampo) {
    return `${primerErrorDeCampo[0]}: ${primerErrorDeCampo[1]}`;
  }
  if (json?.detail) {
    return json.detail;
  }
  if (status === 401) {
    return 'Tu sesión expiró. Volvé a ingresar.';
  }
  return `Error inesperado (${status})`;
}

export const api = {
  login: (email: string, password: string) => pedir<Sesion>('POST', '/api/auth/login', { email, password }),
  registro: (datos: { nombre: string; email: string; telefono?: string; password: string }) =>
    pedir<Sesion>('POST', '/api/auth/registro', datos),
  yo: () => pedir<Usuario>('GET', '/api/usuarios/me'),

  relaciones: () => pedir<Relacion[]>('GET', '/api/relaciones'),
  relacion: (id: number) => pedir<Relacion>('GET', `/api/relaciones/${id}`),
  invitar: (emailDeudor: string, requiereConfirmacion: boolean) =>
    pedir<Relacion>('POST', '/api/relaciones', { emailDeudor, requiereConfirmacion }),
  aceptar: (id: number) => pedir<Relacion>('POST', `/api/relaciones/${id}/aceptar`),
  rechazar: (id: number) => pedir<Relacion>('POST', `/api/relaciones/${id}/rechazar`),
  cambiarConfirmacion: (id: number, requiereConfirmacion: boolean) =>
    pedir<Relacion>('PATCH', `/api/relaciones/${id}/confirmacion`, { requiereConfirmacion }),
  eliminar: (id: number) => pedir<void>('DELETE', `/api/relaciones/${id}`),

  movimientos: (relacionId: number, estado?: EstadoMovimiento) =>
    pedir<Pagina<Movimiento>>(
      'GET',
      `/api/relaciones/${relacionId}/movimientos?tamanio=50${estado ? `&estado=${estado}` : ''}`,
    ),
  cargo: (relacionId: number, monto: number, descripcion?: string) =>
    pedir<Movimiento>('POST', `/api/relaciones/${relacionId}/cargos`, { monto, descripcion }),
  pago: (relacionId: number, monto: number, medioPago: MedioPago, descripcion?: string) =>
    pedir<Movimiento>('POST', `/api/relaciones/${relacionId}/pagos`, { monto, medioPago, descripcion }),
  confirmarPago: (movimientoId: number) => pedir<Movimiento>('POST', `/api/movimientos/${movimientoId}/confirmar`),
  rechazarPago: (movimientoId: number) => pedir<Movimiento>('POST', `/api/movimientos/${movimientoId}/rechazar`),

  solicitudes: (relacionId: number, estado?: EstadoSolicitud) =>
    pedir<Solicitud[]>('GET', `/api/relaciones/${relacionId}/solicitudes${estado ? `?estado=${estado}` : ''}`),
  pedirCobro: (relacionId: number, monto: number, descripcion?: string) =>
    pedir<Solicitud>('POST', `/api/relaciones/${relacionId}/solicitudes`, { monto, descripcion }),
  pagarSolicitud: (solicitudId: number, medioPago: MedioPago) =>
    pedir<Movimiento>('POST', `/api/solicitudes/${solicitudId}/pagar`, { medioPago }),
  rechazarSolicitud: (solicitudId: number) => pedir<Solicitud>('POST', `/api/solicitudes/${solicitudId}/rechazar`),

  registrarDispositivo: (pushToken: string, plataforma: Plataforma) =>
    pedir<Dispositivo>('POST', '/api/dispositivos', { pushToken, plataforma }),
  eliminarDispositivo: (id: number) => pedir<void>('DELETE', `/api/dispositivos/${id}`),
};

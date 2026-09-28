// Espejo de los DTOs del backend (demo/). Los montos llegan como number.

export type Rol = 'ACREEDOR' | 'DEUDOR';
export type EstadoRelacion = 'INVITADA' | 'ACTIVA' | 'RECHAZADA' | 'ELIMINADA';
export type TipoMovimiento = 'PAGO' | 'CARGO';
export type EstadoMovimiento = 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
export type MedioPago = 'TRANSFERENCIA' | 'EFECTIVO';
export type EstadoSolicitud = 'PENDIENTE' | 'PAGADA' | 'RECHAZADA';
export type Plataforma = 'ANDROID' | 'IOS' | 'WEB';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
}

export interface UsuarioResumen {
  id: number;
  nombre: string;
  email: string;
}

export interface Sesion {
  token: string;
  expiraEn: string;
  usuario: Usuario;
}

export interface Relacion {
  id: number;
  miRol: Rol;
  acreedor: UsuarioResumen;
  deudor: UsuarioResumen;
  saldo: number;
  pendienteConfirmacion: number;
  disponibleParaPagar: number;
  requiereConfirmacion: boolean;
  estado: EstadoRelacion;
  creadoEn: string;
  respondidaEn: string | null;
  eliminadaEn: string | null;
}

export interface Movimiento {
  id: number;
  relacionId: number;
  tipo: TipoMovimiento;
  monto: number;
  estado: EstadoMovimiento;
  medioPago: MedioPago | null;
  requirioConfirmacion: boolean;
  creadoPorId: number;
  solicitudId: number | null;
  descripcion: string | null;
  fecha: string;
  resueltoEn: string | null;
}

export interface Solicitud {
  id: number;
  relacionId: number;
  monto: number;
  estado: EstadoSolicitud;
  descripcion: string | null;
  fecha: string;
  respondidaEn: string | null;
}

export interface Pagina<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface Dispositivo {
  id: number;
  plataforma: Plataforma;
}

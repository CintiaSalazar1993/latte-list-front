export type TipoDeUsuario = 'CLIENTE' | 'DUENIO' | 'ADMIN';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  tipoDeUsuario: TipoDeUsuario;
  fechaAlta: string;
}

/** Datos que se envían al registrar o crear un usuario. */
export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  tipoDeUsuario: TipoDeUsuario;
}

/** Datos editables del perfil propio (la contraseña es opcional). */
export interface UsuarioUpdate {
  nombre: string;
  apellido: string;
  contrasena?: string;
}

export const ROLES_LABEL: Record<TipoDeUsuario, string> = {
  CLIENTE: 'Cliente',
  DUENIO: 'Dueño',
  ADMIN: 'Administrador',
};

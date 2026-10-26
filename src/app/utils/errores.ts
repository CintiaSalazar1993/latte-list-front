import { HttpErrorResponse } from '@angular/common/http';

/** Convierte el error que devuelve el backend ({status, message, errors}) en un texto legible. */
export function mensajeError(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return 'No se pudo conectar con el servidor. ¿Está corriendo el backend en el puerto 8080?';
    const b = e.error;
    if (b && typeof b === 'object') {
      if (b.errors) {
        const detalle = Array.isArray(b.errors) ? b.errors.join(' · ') : Object.values(b.errors).join(' · ');
        if (detalle) return detalle;
      }
      if (b.message) return b.message;
    }
    if (e.status === 403) return 'No tenés permisos para realizar esta acción.';
    if (e.status === 401) return 'Tu sesión no es válida. Iniciá sesión de nuevo.';
  }
  return 'Ocurrió un error inesperado.';
}

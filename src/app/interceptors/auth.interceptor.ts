import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Se ejecuta en TODAS las peticiones HTTP:
 *  - agrega el token JWT en el header Authorization
 *  - si el backend responde 401 (token vencido), cierra la sesión
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const esLoginORegistro = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  let peticion = req;
  if (auth.token() && !esLoginORegistro) {
    peticion = req.clone({ setHeaders: { Authorization: `Bearer ${auth.token()}` } });
  }

  return next(peticion).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401 && !esLoginORegistro) auth.sesionExpirada();
      return throwError(() => e);
    }),
  );
};

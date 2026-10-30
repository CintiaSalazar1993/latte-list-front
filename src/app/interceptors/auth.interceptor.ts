import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // Si hay token, copio el pedido y le agrego el header Authorization
  const request = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 con token: venció la sesión, la cierro y vuelvo al login
      if (error.status === 401 && token) {
        auth.sesionExpirada();
      }

      return throwError(() => error);
    })
  );
};
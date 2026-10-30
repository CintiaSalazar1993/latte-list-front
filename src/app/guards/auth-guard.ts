import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Solo usuarios con sesión iniciada y con un token que el back todavía acepta. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.logueado()) {
    return router.createUrlTree(['/login']);
  }

  return auth.validarToken().pipe(
    map(() => true),
    catchError(() => {
      auth.salir(false);
      return of(router.createUrlTree(['/login']));
    })
  );
};
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TipoDeUsuario } from '../models/Usuario';
import { AuthService } from '../services/auth.service';
import { NotificacionesService } from '../services/notificaciones.service';

/*
 * Guards (rutas protegidas): deciden si se puede entrar a una ruta.
 * Devuelven true (se puede entrar) o una redirección a otra ruta.
 * (Se usan en app.routes.ts con la propiedad canActivate.)
 */

/** Solo usuarios con sesión iniciada. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.logueado() ? true : router.createUrlTree(['/login']);
};

/** Login y registro: solo para quien NO tiene sesión. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.logueado() ? router.createUrlTree([auth.inicioPorRol()]) : true;
};

/** Solo usuarios con alguno de los roles indicados. */
export const rolGuard = (...roles: TipoDeUsuario[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const notificaciones = inject(NotificacionesService);

    if (!auth.logueado()) return router.createUrlTree(['/login']);
    if (auth.tieneRol(...roles)) return true;

    notificaciones.error('No tenés permisos para entrar a esa sección.');
    return router.createUrlTree([auth.inicioPorRol()]);
  };
};

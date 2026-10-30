import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TipoDeUsuario } from '../models/Usuario';
import { AuthService } from '../services/auth.service';
import { NotificacionesService } from '../services/notificaciones.service';

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
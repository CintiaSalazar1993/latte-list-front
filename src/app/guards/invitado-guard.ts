import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Login y registro: solo para quien NO tiene sesión. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.logueado() ? router.createUrlTree([auth.inicioPorRol()]) : true;
};
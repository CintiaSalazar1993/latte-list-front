import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, rolGuard } from './guards/guards';
import { Home } from './pages/home/home';
import { NoEncontrada } from './pages/errores/errores';
import { AdminCafes } from './pages/admin-cafes/admin-cafes';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Cafes } from './pages/cafes/cafes';
import { CafeDetalle } from './pages/cafe-detalle/cafe-detalle';
import { CafeForm } from './pages/cafe-form/cafe-form';
import { MisCafes } from './pages/mis-cafes/mis-cafes';
import { Listas } from './pages/listas/listas';
import { ListaDetalle } from './pages/lista-detalle/lista-detalle';
import { MisResenas } from './pages/mis-resenas/mis-resenas';
import { Perfil } from './pages/perfil/perfil';
import { Usuarios } from './pages/usuarios/usuarios';
import { ResenasRecibidas } from './pages/resenas-recibidas/resenas-recibidas';
import { AdminResenas } from './pages/admin-resenas/admin-resenas';
import { Dashboard } from './pages/dashboard/dashboard';

/*
 * Cada ruta indica: la URL (path), el componente a mostrar y, si hace falta,
 * un guard (canActivate) que decide quién puede entrar.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home, canActivate: [invitadoGuard] },

  // Públicas (solo sin sesión)
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, canActivate: [invitadoGuard] },

  // Cafés (CRUD 1): ver = cualquier usuario logueado; crear/editar según rol
  { path: 'cafes', component: Cafes, canActivate: [authGuard] },
  { path: 'cafes/nuevo', component: CafeForm, canActivate: [rolGuard('DUENIO', 'ADMIN')] },
  { path: 'cafes/:id/editar', component: CafeForm, canActivate: [rolGuard('DUENIO')] }, // ruta paramétrica
  { path: 'cafes/:id', component: CafeDetalle, canActivate: [authGuard] }, // ruta paramétrica

  // Solo CLIENTE: listas (CRUD 2) y reseñas
  { path: 'listas', component: Listas, canActivate: [rolGuard('CLIENTE')] },
  { path: 'listas/:id', component: ListaDetalle, canActivate: [rolGuard('CLIENTE')] },
  { path: 'mis-resenas', component: MisResenas, canActivate: [rolGuard('CLIENTE')] },

  // Solo DUENIO
  { path: 'mis-cafes', component: MisCafes, canActivate: [rolGuard('DUENIO')] },
  { path: 'resenas-recibidas', component: ResenasRecibidas, canActivate: [rolGuard('DUENIO')] },

  // DUENIO y ADMIN
  { path: 'dashboard', component: Dashboard, canActivate: [rolGuard('ADMIN')] },

  // Solo ADMIN: usuarios (CRUD 3)
  { path: 'admin/usuarios', component: Usuarios, canActivate: [rolGuard('ADMIN')] },
  { path: 'admin/cafes', component: AdminCafes, canActivate: [rolGuard('ADMIN')] },
  { path: 'admin/resenas', component: AdminResenas, canActivate: [rolGuard('ADMIN')] },

  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  { path: '**', component: NoEncontrada },
];

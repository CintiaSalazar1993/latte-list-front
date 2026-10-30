import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ROLES_LABEL } from '../../models/Usuario';
import { AuthService } from '../../services/auth.service';

interface Enlace {
  ruta: string;
  texto: string;
  exacto?: boolean;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  rolLabel = ROLES_LABEL;
  menuAbierto = signal(false);

  /** Los enlaces cambian según el rol: computed se recalcula solo cuando cambia la sesión. */
  enlaces = computed<Enlace[]>(() => {
    switch (this.auth.rol()) {
      case 'CLIENTE':
        return [
          { ruta: '/cafes', texto: 'Explorar' },
          { ruta: '/listas', texto: 'Mis listas' },
          { ruta: '/mis-resenas', texto: 'Mis reseñas' },
        ];
      case 'DUENIO':
        return [
          { ruta: '/mis-cafes', texto: 'Mis cafés' },
          { ruta: '/resenas-recibidas', texto: 'Reseñas' },
          { ruta: '/cafes', texto: 'Explorar' },
        ];
      case 'ADMIN':
        return [
          { ruta: '/dashboard', texto: 'Panel' },
          { ruta: '/admin/cafes', texto: 'Cafés' },
          { ruta: '/admin/usuarios', texto: 'Usuarios' },
          { ruta: '/admin/resenas', texto: 'Reseñas' },
          { ruta: '/cafes', texto: 'Explorar' },
        ];
      default:
        return [];
    }
  });

  iniciales = computed(() => {
    const u = this.auth.usuario();
    return u ? ((u.nombre[0] ?? '') + (u.apellido[0] ?? '')).toUpperCase() : '';
  });

  constructor(public auth: AuthService) {}

  alternarMenu() {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  salir() {
    this.cerrarMenu();
    this.auth.salir();
  }
}

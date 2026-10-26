import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink, EstadoVacio],
  template: `
    <div class="contenedor pagina">
      <app-estado-vacio titulo="Esta página no existe" texto="Revisá la dirección o volvé al inicio.">
        <a class="btn" [routerLink]="auth.inicioPorRol()">Ir al inicio</a>
      </app-estado-vacio>
    </div>
  `,
})
export class NoEncontrada {
  constructor(public auth: AuthService) {}
}

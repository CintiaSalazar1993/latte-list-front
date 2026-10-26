import { Component, input } from '@angular/core';

/** Pantalla vacía con una taza vacía dibujada, un título y una acción (se proyecta con ng-content). */
@Component({
  selector: 'app-estado-vacio',
  templateUrl: './estado-vacio.html',
  styleUrl: './estado-vacio.css',
})
export class EstadoVacio {
  titulo = input.required<string>();
  texto = input<string>('');
}

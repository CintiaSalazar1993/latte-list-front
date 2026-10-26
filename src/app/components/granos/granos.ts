import { Component, computed, input } from '@angular/core';

/** Puntuación de 0 a 5 mostrada con granos de café (solo lectura). Soporta decimales: 3.6 = 3 granos llenos y uno al 60%. */
@Component({
  selector: 'app-granos',
  templateUrl: './granos.html',
  styleUrl: './granos.css',
})
export class Granos {
  private static contador = 0;
  idBase = `grano-${Granos.contador++}-`;
  grano =
    'M12 2.2c4.6 0 8 4.3 8 9.8s-3.4 9.8-8 9.8-8-4.3-8-9.8 3.4-9.8 8-9.8zm.9 2.1c-1.7 2-2.2 4.2-1.3 6.6.9 2.5.6 4.9-1.1 7.4-.3.4-.2.8.2 1 .3.2.7.1 1-.3 1.9-2.8 2.3-5.6 1.2-8.5-.7-2-.4-3.8 1-5.4.3-.3.2-.8-.1-1-.3-.2-.7-.1-.9.2z';

  valor = input<number | null>(null);
  tamanio = input(18);

  rellenos = computed(() => {
    const v = this.valor() ?? 0;
    return [0, 1, 2, 3, 4].map((i) => Math.max(0, Math.min(1, v - i)));
  });
  etiqueta = computed(() => (this.valor() == null ? 'Sin puntuación' : `${this.valor()} de 5 granos`));
}

import { Component, computed, input } from '@angular/core';
import { CostoPromedio } from '../../models/Cafe';
import { COSTO_LABEL } from '../../utils/etiquetas';

/** Muestra "$$$" con los signos no alcanzados apagados. */
@Component({
  selector: 'app-costo',
  templateUrl: './costo.html',
})
export class Costo {
  valor = input.required<CostoPromedio>();
  nivel = computed(() => this.valor().length);
  nombre = computed(() => COSTO_LABEL[this.valor()].toLowerCase());
}

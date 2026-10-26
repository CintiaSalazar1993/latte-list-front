import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cafe } from '../../models/Cafe';
import { EtiquetaPipe } from '../../pipes/etiqueta.pipe';
import { Costo } from '../costo/costo';
import { Granos } from '../granos/granos';
import { TazaLogo } from '../taza-logo/taza-logo';

/** Tarjeta de café para las grillas. El padre (lista de cafés) le pasa cada café con input(). */
@Component({
  selector: 'app-cafe-card',
  imports: [RouterLink, TazaLogo, Granos, Costo, EtiquetaPipe, DecimalPipe],
  templateUrl: './cafe-card.html',
  styleUrl: './cafe-card.css',
})
export class CafeCard {
  cafe = input.required<Cafe>();
  private max = 3;
  etiquetasVisibles = computed(() => this.cafe().etiquetas.slice(0, this.max));
  restantes = computed(() => this.cafe().etiquetas.length - this.max);
}

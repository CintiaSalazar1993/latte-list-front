import { Injectable, signal } from '@angular/core';
import { Params } from '@angular/router';

/**
 * Recuerda los últimos filtros usados en "Explorar cafés".
 * Es un Singleton (providedIn: 'root'), así que el valor sobrevive al cambiar de página:
 * la ficha de un café lo usa para que "Volver a explorar" mantenga los filtros.
 */
@Injectable({
  providedIn: 'root',
})
export class FiltrosCafesService {
  ultimos = signal<Params>({});
}

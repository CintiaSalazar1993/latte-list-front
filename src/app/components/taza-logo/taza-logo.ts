import { Component, computed, input, signal } from '@angular/core';

/**
 * El logo del café enmarcado como una taza vista desde arriba.
 * Si no hay logo o la imagen falla, muestra las iniciales sobre "café con leche".
 * Recibe datos del padre con input() (comunicación padre -> hijo).
 */
@Component({
  selector: 'app-taza-logo',
  templateUrl: './taza-logo.html',
  styleUrl: './taza-logo.css',
})
export class TazaLogo {
  logo = input<string | null>(null);
  nombre = input.required<string>();
  tamanio = input(72);

  fallo = signal(false);
  iniciales = computed(() =>
    this.nombre()
      .split(/\s+/)
      .filter((p) => p.length > 0)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join(''),
  );
}

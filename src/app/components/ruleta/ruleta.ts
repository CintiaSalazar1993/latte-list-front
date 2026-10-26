import { Component, computed, input, output, signal } from '@angular/core';

import { CafeResumen } from '../../models/CafeResumen';

interface Segmento {
  cafe: CafeResumen;
  path: string;
  color: string;
  colorTexto: string;
  labelX: number;
  labelY: number;
  rotacionLabel: number;
  texto: string;
}

const C = 160; // centro
const R = 150; // radio
const COLORES = [
  { fondo: '#1e5a63', texto: '#ffffff' },
  { fondo: '#d58b2e', texto: '#24170f' },
  { fondo: '#7aa8ad', texto: '#113a40' },
  { fondo: '#f6e6cf', texto: '#24170f' },
];

/**
 * Ruleta SVG (componente hijo: recibe los cafés con input() y avisa el ganador con output()). El componente padre pide el café ganador al backend
 * (GET /listas/{id}/aleatorio) y llama a girarHacia(id): la rueda
 * gira y frena justo en ese segmento.
 */
@Component({
  selector: 'app-ruleta',
  templateUrl: './ruleta.html',
  styleUrl: './ruleta.css',
})
export class Ruleta {
  cafes = input.required<CafeResumen[]>();
  termino = output<CafeResumen>();

  rotacion = signal(0);
  girando = signal(false);
  private ganador: CafeResumen | null = null;

  segmentos = computed<Segmento[]>(() => {
    const cafes = this.cafes();
    const n = cafes.length;
    const paso = 360 / Math.max(n, 1);
    const largo = n > 10 ? 10 : n > 6 ? 13 : 16;
    return cafes.map((cafe, i) => {
      const a1 = i * paso;
      const a2 = (i + 1) * paso;
      const medio = a1 + paso / 2;
      const [x1, y1] = punto(a1, R);
      const [x2, y2] = punto(a2, R);
      const arcoLargo = paso > 180 ? 1 : 0;
      const [lx, ly] = punto(medio, n === 1 ? 0 : R * 0.62);
      // colores alternados (evita que el último y el primero queden iguales)
      const idx = n > 1 && i === n - 1 && n % COLORES.length === 1 ? 1 : i % COLORES.length;
      return {
        cafe,
        path: `M${C},${C} L${x1},${y1} A${R},${R} 0 ${arcoLargo} 1 ${x2},${y2} Z`,
        color: COLORES[idx].fondo,
        colorTexto: COLORES[idx].texto,
        labelX: n === 1 ? C : lx,
        labelY: n === 1 ? C - 60 : ly,
        rotacionLabel: n === 1 ? 0 : medio + (medio > 180 ? 90 : -90),
        texto: cafe.nombre.length > largo ? cafe.nombre.slice(0, largo - 1) + '…' : cafe.nombre,
      };
    });
  });

  /** Gira 5 vueltas y frena con el café elegido bajo el puntero (arriba). */
  girarHacia(cafeId: number): void {
    const n = this.cafes().length;
    const i = this.cafes().findIndex((c) => c.id === cafeId);
    if (i < 0 || n === 0) return;
    this.ganador = this.cafes()[i];
    const paso = 360 / n;
    // un poco de azar dentro del segmento para que no frene siempre en el centro
    const jitter = (Math.random() - 0.5) * paso * 0.6;
    const objetivo = (360 - (i * paso + paso / 2) + jitter + 360) % 360;
    const actual = this.rotacion();
    const base = actual - (actual % 360);
    this.girando.set(true);
    this.rotacion.set(base + 360 * 5 + objetivo);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(() => this.alTerminar(), 50);
    }
  }

  alTerminar(): void {
    if (!this.girando()) return;
    this.girando.set(false);
    if (this.ganador) this.termino.emit(this.ganador);
  }
}

/** Ángulo 0° = arriba, sentido horario. */
function punto(angulo: number, radio: number): [number, number] {
  const rad = ((angulo - 90) * Math.PI) / 180;
  return [+(C + radio * Math.cos(rad)).toFixed(2), +(C + radio * Math.sin(rad)).toFixed(2)];
}

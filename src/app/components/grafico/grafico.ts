import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

// Estilo por defecto de todos los gráficos, alineado con la paleta de la app.
Chart.defaults.font.family = "'Figtree', system-ui, sans-serif";
Chart.defaults.color = '#5b4c42';
Chart.defaults.borderColor = '#e1e6e4';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.tooltip.backgroundColor = '#113a40';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;

/** Colores de las series (de más a menos protagonismo). */
export const COLORES_GRAFICO = ['#1e5a63', '#d58b2e', '#7aa8ad', '#8d5a26', '#b9cfd1', '#e9c48f'];

/** Envoltorio simple de Chart.js: recibe la configuración del gráfico y lo dibuja. */
@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.html',
  styleUrl: './grafico.css',
})
export class Grafico implements OnDestroy {
  config = input.required<ChartConfiguration>();
  alto = input(280);
  descripcion = input('Gráfico');
  lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');

  private chart?: Chart;

  constructor() {
    // effect: se vuelve a ejecutar cada vez que cambia la configuración que llega del padre
    effect(() => {
      const cfg = this.config();
      this.chart?.destroy();
      this.chart = new Chart(this.lienzo().nativeElement, {
        ...cfg,
        options: { responsive: true, maintainAspectRatio: false, ...cfg.options },
      });
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}

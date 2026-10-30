import { Component, OnInit, computed, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';

import { Grafico, COLORES_GRAFICO } from '../../components/grafico/grafico';
import { Granos } from '../../components/granos/granos';
import { Etiqueta } from '../../models/Cafe';
import { MetricasGlobales } from '../../models/Metricas';
import { MetricasService } from '../../services/metricas.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { ETIQUETA_LABEL } from '../../utils/etiquetas';
import { mensajeError } from '../../utils/errores';
import { formatearNumero } from '../../utils/formato';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Panel del ADMIN: métricas globales del sistema con Chart.js (RF28). Las calcula el back. */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Grafico, Granos],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  formatearNumero = formatearNumero;
  
  constructor(
    private metricasService: MetricasService,
    private notificaciones: NotificacionesService,
  ) {}

  metricas = signal<MetricasGlobales | null>(null);
  cargando = signal(true);

  graficoRoles = computed<ChartConfiguration>(() => {
    const m = this.metricas();
    return {
      type: 'doughnut',
      data: {
        labels: ['Clientes', 'Dueños', 'Administradores'],
        datasets: [{ data: [m?.clientes ?? 0, m?.duenios ?? 0, m?.admins ?? 0], backgroundColor: COLORES_GRAFICO.slice(0, 3), borderColor: '#fff', borderWidth: 2 }],
      },
      options: { cutout: '62%', plugins: { legend: { position: 'bottom' } } },
    };
  });

  graficoCostos = computed<ChartConfiguration>(() => {
    const c = this.metricas()?.cafesPorCosto ?? {};
    return {
      type: 'bar',
      data: {
        labels: ['$ Económico', '$$ Intermedio', '$$$ Alto'],
        datasets: [{ data: [c['$'] ?? 0, c['$$'] ?? 0, c['$$$'] ?? 0], backgroundColor: ['#e9c48f', '#d58b2e', '#8d5a26'], borderRadius: 8, maxBarThickness: 60 }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { precision: 0 } }, x: { grid: { display: false } } },
      },
    };
  });

  graficoEtiquetas = computed<ChartConfiguration>(() => {
    const top = Object.entries(this.metricas()?.cafesPorEtiqueta ?? {});
    return {
      type: 'bar',
      data: {
        labels: top.map(([e]) => ETIQUETA_LABEL[e as Etiqueta]),
        datasets: [{ data: top.map(([, n]) => n), backgroundColor: COLORES_GRAFICO[0], borderRadius: 6, barThickness: 16 }],
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { precision: 0 } }, y: { grid: { display: false } } },
      },
    };
  });

  /** Altas de usuarios en los últimos 6 meses. */
  graficoAltas = computed<ChartConfiguration>(() => {
    const altas = this.metricas()?.altasUltimosMeses ?? [];
    return {
      type: 'bar',
      data: {
        labels: altas.map((a) => MESES[parseInt(a.mes.slice(5), 10) - 1]),
        datasets: [
          { label: 'Clientes', data: altas.map((a) => a.clientes), backgroundColor: COLORES_GRAFICO[0], borderRadius: 6, maxBarThickness: 44 },
          { label: 'Dueños', data: altas.map((a) => a.duenios), backgroundColor: COLORES_GRAFICO[1], borderRadius: 6, maxBarThickness: 44 },
        ],
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    };
  });

  ngOnInit(): void {
    this.metricasService.getMetricasGlobales().subscribe({
      next: (m) => {
        this.metricas.set(m);
        this.cargando.set(false);
      },
      error: (err) => {
        this.notificaciones.error(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
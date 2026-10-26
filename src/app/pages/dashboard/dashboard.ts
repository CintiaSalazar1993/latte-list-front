import { Component, OnInit, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';

import { Grafico, COLORES_GRAFICO } from '../../components/grafico/grafico';
import { Granos } from '../../components/granos/granos';
import { Cafe, Etiqueta } from '../../models/Cafe';
import { Usuario } from '../../models/Usuario';
import { CafeService } from '../../services/cafe.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { ETIQUETA_LABEL } from '../../utils/etiquetas';
import { mensajeError } from '../../utils/errores';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Panel del ADMIN: métricas globales del sistema con Chart.js (RF28). */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe, Grafico, Granos],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  constructor(
    private usuarioService: UsuarioService,
    private cafeService: CafeService,
    private notificaciones: NotificacionesService,
  ) {}

  usuarios = signal<Usuario[]>([]);
  cafes = signal<Cafe[]>([]);
  cargando = signal(true);

  porRol = computed(() => {
    const r = { CLIENTE: 0, DUENIO: 0, ADMIN: 0 };
    for (const u of this.usuarios()) r[u.tipoDeUsuario]++;
    return r;
  });
  totalResenas = computed(() => this.cafes().reduce((s, c) => s + c.cantidadResenas, 0));
  /** Promedio ponderado por cantidad de reseñas. */
  promedio = computed(() => {
    let suma = 0;
    let n = 0;
    for (const c of this.cafes()) {
      if (c.puntuacionPromedio !== null) {
        suma += c.puntuacionPromedio * c.cantidadResenas;
        n += c.cantidadResenas;
      }
    }
    return n ? suma / n : null;
  });

  topCafes = computed(() =>
    this.cafes()
      .filter((c) => c.puntuacionPromedio !== null)
      .sort((a, b) => b.puntuacionPromedio! - a.puntuacionPromedio! || b.cantidadResenas - a.cantidadResenas)
      .slice(0, 5),
  );

  graficoRoles = computed<ChartConfiguration>(() => {
    const r = this.porRol();
    return {
      type: 'doughnut',
      data: {
        labels: ['Clientes', 'Dueños', 'Administradores'],
        datasets: [{ data: [r.CLIENTE, r.DUENIO, r.ADMIN], backgroundColor: COLORES_GRAFICO.slice(0, 3), borderColor: '#fff', borderWidth: 2 }],
      },
      options: { cutout: '62%', plugins: { legend: { position: 'bottom' } } },
    };
  });

  graficoCostos = computed<ChartConfiguration>(() => {
    const cuenta = { $: 0, $$: 0, $$$: 0 };
    for (const c of this.cafes()) cuenta[c.costoPromedio]++;
    return {
      type: 'bar',
      data: {
        labels: ['$ Económico', '$$ Intermedio', '$$$ Alto'],
        datasets: [{ data: [cuenta.$, cuenta.$$, cuenta.$$$], backgroundColor: ['#e9c48f', '#d58b2e', '#8d5a26'], borderRadius: 8, maxBarThickness: 60 }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { precision: 0 } }, x: { grid: { display: false } } },
      },
    };
  });

  graficoEtiquetas = computed<ChartConfiguration>(() => {
    const cuenta = new Map<Etiqueta, number>();
    for (const c of this.cafes()) for (const e of c.etiquetas) cuenta.set(e, (cuenta.get(e) ?? 0) + 1);
    const top = [...cuenta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      type: 'bar',
      data: {
        labels: top.map(([e]) => ETIQUETA_LABEL[e]),
        datasets: [{ data: top.map(([, n]) => n), backgroundColor: COLORES_GRAFICO[0], borderRadius: 6, barThickness: 16 }],
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { precision: 0 } }, y: { grid: { display: false } } },
      },
    };
  });

  /** Altas de usuarios en los últimos 6 meses (a partir de fechaAlta). */
  graficoAltas = computed<ChartConfiguration>(() => {
    const hoy = new Date();
    const meses: { clave: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      meses.push({ clave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: MESES[d.getMonth()] });
    }
    const contar = (rol: string) =>
      meses.map((m) => this.usuarios().filter((u) => u.tipoDeUsuario === rol && u.fechaAlta.startsWith(m.clave)).length);
    return {
      type: 'bar',
      data: {
        labels: meses.map((m) => m.label),
        datasets: [
          { label: 'Clientes', data: contar('CLIENTE'), backgroundColor: COLORES_GRAFICO[0], borderRadius: 6, maxBarThickness: 44 },
          { label: 'Dueños', data: contar('DUENIO'), backgroundColor: COLORES_GRAFICO[1], borderRadius: 6, maxBarThickness: 44 },
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
    forkJoin({ usuarios: this.usuarioService.getUsuarios(), cafes: this.cafeService.getCafes() }).subscribe({
      next: ({ usuarios, cafes }) => {
        this.usuarios.set(usuarios);
        this.cafes.set(cafes);
        this.cargando.set(false);
      },
      error: (err) => {
        this.notificaciones.error(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Costo } from '../../components/costo/costo';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { COLORES_GRAFICO, Grafico } from '../../components/grafico/grafico';
import { Granos } from '../../components/granos/granos';
import { TazaLogo } from '../../components/taza-logo/taza-logo';
import { Cafe } from '../../models/Cafe';
import { MetricasDuenio } from '../../models/Metricas';
import { Resena } from '../../models/Resena';
import { AuthService } from '../../services/auth.service';
import { CafeService } from '../../services/cafe.service';
import { ConfirmService } from '../../services/confirm.service';
import { MetricasService } from '../../services/metricas.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { ResenaService } from '../../services/resena.service';
import { mensajeError } from '../../utils/errores';

/** Panel del DUENIO: sus cafés (CRUD), métricas y gráficos (RF17, RF18, RF25, RF26). */
@Component({
  selector: 'app-mis-cafes',
  imports: [RouterLink, DecimalPipe, DatePipe, TazaLogo, Granos, Costo, Grafico, EstadoVacio],
  templateUrl: './mis-cafes.html',
  styleUrl: './mis-cafes.css',
})
export class MisCafes implements OnInit {
  cafes = signal<Cafe[]>([]);
  resenas = signal<Resena[]>([]);
  cargando = signal(true);

  // RF25: las métricas (totales y ranking) las calcula el back
  metricas = signal<MetricasDuenio | null>(null);
  ranking = computed(
    () =>
      new Map<number, number>(
        (this.metricas()?.cafes ?? [])
          .filter((c) => c.posicion !== null)
          .map((c) => [c.cafeId, c.posicion!] as [number, number]),
      ),
  );
  totalRankeados = computed(() => this.metricas()?.totalRankeados ?? 0);
  totalResenas = computed(() => this.metricas()?.totalResenas ?? 0);
  promedioGeneral = computed(() => this.metricas()?.promedioGeneral ?? null);
  ultimas = computed(() => this.resenas().slice(0, 5)); // el backend ya las manda de la más nueva a la más vieja

  graficoPromedios = computed<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: this.cafes().map((c) => c.nombre),
      datasets: [
        {
          label: 'Puntuación promedio',
          data: this.cafes().map((c) => c.puntuacionPromedio ?? 0),
          backgroundColor: COLORES_GRAFICO[0],
          borderRadius: 8,
          maxBarThickness: 46,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } }, x: { grid: { display: false } } },
    },
  }));

  graficoDistribucion = computed<ChartConfiguration>(() => {
    const cuenta = [0, 0, 0, 0, 0];
    for (const r of this.resenas()) cuenta[r.puntuacionGeneral - 1]++;
    return {
      type: 'doughnut',
      data: {
        labels: ['1 grano', '2 granos', '3 granos', '4 granos', '5 granos'],
        datasets: [
          {
            data: cuenta,
            backgroundColor: ['#e8d6d3', '#b9cfd1', '#7aa8ad', '#e9c48f', '#d58b2e'],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: { cutout: '62%', plugins: { legend: { position: 'bottom' } } },
    };
  });

  constructor(
    public auth: AuthService,
    private cafeService: CafeService,
    private resenaService: ResenaService,
    private metricasService: MetricasService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.traerDatos();
  }

  traerDatos() {
    this.cafeService.getMisCafes().subscribe({
      next: (data) => {
        this.cafes.set(data);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificaciones.error(mensajeError(e));
        this.cargando.set(false);
      },
    });
    // RF26: las reseñas de todos mis cafés en un solo pedido
    this.resenaService.getResenasRecibidas().subscribe({
      next: (data) => this.resenas.set(data),
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });

    // RF25: totales y ranking calculados por el back
    this.metricasService.getMisMetricas().subscribe({
      next: (m) => this.metricas.set(m),
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }

  async eliminar(cafe: Cafe) {
    const ok = await this.confirm.preguntar({
      titulo: 'Eliminar café',
      mensaje: `Se va a eliminar "${cafe.nombre}" junto con sus ${cafe.cantidadResenas} reseñas. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar café',
      peligroso: true,
    });
    if (!ok) return;
    this.cafeService.deleteCafe(cafe.id).subscribe({
      next: () => {
        this.notificaciones.ok(`"${cafe.nombre}" eliminado`);
        this.traerDatos();
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }
}
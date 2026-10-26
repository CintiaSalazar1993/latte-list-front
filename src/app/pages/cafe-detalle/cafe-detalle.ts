import { DatePipe, DecimalPipe, LowerCasePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Costo } from '../../components/costo/costo';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Grafico } from '../../components/grafico/grafico';
import { Granos } from '../../components/granos/granos';
import { SelectorGranos } from '../../components/selector-granos/selector-granos';
import { TazaLogo } from '../../components/taza-logo/taza-logo';
import { Cafe } from '../../models/Cafe';
import { Lista } from '../../models/Lista';
import { Resena, ResenaDetalle } from '../../models/Resena';
import { CostoPipe, EtiquetaPipe } from '../../pipes/etiqueta.pipe';
import { AuthService } from '../../services/auth.service';
import { CafeService } from '../../services/cafe.service';
import { ConfirmService } from '../../services/confirm.service';
import { ListaService } from '../../services/lista.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { ResenaService } from '../../services/resena.service';
import { mensajeError } from '../../utils/errores';

/** RF4 (ficha), RF8 (reseñar), RF10 (agregar a lista), RF11 (reseñas del café), RF16/18/22 (bajas). */
@Component({
  selector: 'app-cafe-detalle',
  imports: [
    ReactiveFormsModule, RouterLink, NgClass, DecimalPipe, DatePipe, LowerCasePipe,
    TazaLogo, Granos, SelectorGranos, Costo, EstadoVacio, Grafico, EtiquetaPipe, CostoPipe,
  ],
  templateUrl: './cafe-detalle.html',
  styleUrl: './cafe-detalle.css',
})
export class CafeDetalle implements OnInit {
  cafe = signal<Cafe | null>(null);
  resenas = signal<Resena[]>([]);
  misResenasIds = signal<number[]>([]);
  listas = signal<Lista[]>([]);
  cargando = signal(true);
  noEncontrado = signal(false);

  menuListasAbierto = signal(false);
  detalleAbierto = signal<number | null>(null);
  detalles = signal<Record<number, ResenaDetalle>>({});
  enviando = signal(false);
  errorResena = signal('');

  // computed: se recalculan solos cuando cambian las signals de las que dependen
  esMiCafe = computed(() => this.auth.tieneRol('DUENIO') && this.cafe()?.duenioId === this.auth.usuario()?.id);
  favoritos = computed(() => this.listas().find((l) => l.favoritos) ?? null);
  enFavoritos = computed(() => {
    const id = this.cafe()?.id;
    return !!this.favoritos()?.cafes.some((c) => c.id === id);
  });
  yaResenado = computed(() => this.resenas().some((r) => this.misResenasIds().includes(r.id)));
  urlMapa = computed(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((this.cafe()?.direccion ?? '') + ', Mar del Plata')}`,
  );

  /** Distribución de puntuaciones generales para el gráfico (Chart.js). */
  grafico = computed<ChartConfiguration>(() => {
    const cuenta = [0, 0, 0, 0, 0];
    for (const r of this.resenas()) cuenta[r.puntuacionGeneral - 1]++;
    return {
      type: 'bar',
      data: {
        labels: ['5 granos', '4 granos', '3 granos', '2 granos', '1 grano'],
        datasets: [{ data: [...cuenta].reverse(), backgroundColor: '#d58b2e', borderRadius: 6, barThickness: 14 }],
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { precision: 0 }, grid: { display: false } }, y: { grid: { display: false } } },
      },
    };
  });

  private puntaje = [Validators.required, Validators.min(1), Validators.max(5)];
  form = new FormGroup({
    puntuacionGeneral: new FormControl(0, this.puntaje),
    puntuacionPrecio: new FormControl(0, this.puntaje),
    puntuacionAtencion: new FormControl(0, this.puntaje),
    comentario: new FormControl('', [Validators.required, Validators.maxLength(255)]),
  });

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute, // sirve para leer el :id de la URL
    private router: Router,
    private cafeService: CafeService,
    private resenaService: ResenaService,
    private listaService: ListaService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.traerCafe(id);
    this.traerResenas(id);
    if (this.auth.tieneRol('CLIENTE')) {
      this.listaService.getListas().subscribe({ next: (data) => this.listas.set(data) });
      this.resenaService.getMisResenas().subscribe({ next: (data) => this.misResenasIds.set(data.map((r) => r.id)) });
    }
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  largoComentario(): number {
    return (this.form.value.comentario ?? '').length;
  }

  traerCafe(id: number) {
    this.cafeService.getCafeById(id).subscribe({
      next: (data) => {
        this.cafe.set(data);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        if (e.status === 404) this.noEncontrado.set(true);
        else this.notificaciones.error(mensajeError(e));
      },
    });
  }

  traerResenas(id: number) {
    this.resenaService.getResenasDeCafe(id).subscribe({
      next: (data) => this.resenas.set(data),
      error: () => this.resenas.set([]),
    });
  }

  // ---------- listas (CLIENTE) ----------
  estaEnLista(lista: Lista): boolean {
    return lista.cafes.some((c) => c.id === this.cafe()?.id);
  }

  alternarLista(lista: Lista) {
    const cafe = this.cafe();
    if (!cafe) return;
    const agregando = !this.estaEnLista(lista);
    const peticion = agregando
      ? this.listaService.postCafeEnLista(lista.id, cafe.id)
      : this.listaService.deleteCafeDeLista(lista.id, cafe.id);
    peticion.subscribe({
      next: (actualizada) => {
        this.listas.update((ls) => ls.map((l) => (l.id === actualizada.id ? actualizada : l)));
        this.notificaciones.ok(agregando ? `Guardado en "${lista.nombre}"` : `Quitado de "${lista.nombre}"`);
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }

  alternarFavorito() {
    const fav = this.favoritos();
    if (fav) this.alternarLista(fav);
  }

  // ---------- reseñas ----------
  verDetalle(r: Resena) {
    if (this.detalleAbierto() === r.id) {
      this.detalleAbierto.set(null);
      return;
    }
    this.detalleAbierto.set(r.id);
    if (!this.detalles()[r.id]) {
      this.resenaService.getResenaById(r.id).subscribe({
        next: (d) => this.detalles.update((m) => ({ ...m, [r.id]: d })),
        error: (e) => this.notificaciones.error(mensajeError(e)),
      });
    }
  }

  esMia(r: Resena): boolean {
    return this.misResenasIds().includes(r.id);
  }

  puedeBorrar(r: Resena): boolean {
    return this.auth.tieneRol('ADMIN') || this.esMia(r);
  }

  publicarResena() {
    const cafe = this.cafe();
    if (!cafe) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorResena.set('Completá las tres puntuaciones y el comentario.');
      return;
    }
    const v = this.form.value;
    this.enviando.set(true);
    this.errorResena.set('');
    this.resenaService
      .postResena(cafe.id, {
        puntuacionGeneral: v.puntuacionGeneral ?? 1,
        puntuacionPrecio: v.puntuacionPrecio ?? 1,
        puntuacionAtencion: v.puntuacionAtencion ?? 1,
        comentario: (v.comentario ?? '').trim(),
      })
      .subscribe({
        next: () => {
          this.notificaciones.ok('¡Gracias! Publicamos tu reseña.');
          this.form.reset({ puntuacionGeneral: 0, puntuacionPrecio: 0, puntuacionAtencion: 0, comentario: '' });
          this.enviando.set(false);
          this.traerCafe(cafe.id);
          this.traerResenas(cafe.id);
          this.resenaService.getMisResenas().subscribe({ next: (data) => this.misResenasIds.set(data.map((x) => x.id)) });
        },
        error: (e) => {
          this.errorResena.set(mensajeError(e));
          this.enviando.set(false);
        },
      });
  }

  async borrarResena(r: Resena) {
    const ok = await this.confirm.preguntar({
      titulo: 'Eliminar reseña',
      mensaje: this.auth.tieneRol('ADMIN')
        ? `Se va a eliminar la reseña de ${r.autor}. Esta acción no se puede deshacer.`
        : 'Se va a eliminar tu reseña. Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar reseña',
      peligroso: true,
    });
    if (!ok) return;
    this.resenaService.deleteResena(r.id).subscribe({
      next: () => {
        this.notificaciones.ok('Reseña eliminada');
        this.misResenasIds.update((ids) => ids.filter((x) => x !== r.id));
        this.traerCafe(r.cafeId);
        this.traerResenas(r.cafeId);
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }

  // ---------- gestión (DUENIO / ADMIN) ----------
  async eliminarCafe() {
    const cafe = this.cafe();
    if (!cafe) return;
    const ok = await this.confirm.preguntar({
      titulo: 'Eliminar café',
      mensaje: `Se va a eliminar "${cafe.nombre}" junto con sus ${cafe.cantidadResenas} reseñas. También se quita de las listas de los clientes.`,
      textoConfirmar: 'Eliminar café',
      peligroso: true,
    });
    if (!ok) return;
    this.cafeService.deleteCafe(cafe.id).subscribe({
      next: () => {
        this.notificaciones.ok(`"${cafe.nombre}" eliminado`);
        this.router.navigateByUrl(this.auth.tieneRol('ADMIN') ? '/admin/cafes' : '/mis-cafes');
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }
}

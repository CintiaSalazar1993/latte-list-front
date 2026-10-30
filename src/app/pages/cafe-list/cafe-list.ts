import { Component, OnInit, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { CafeCard } from '../../components/cafe-card/cafe-card';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Cafe, CostoPromedio, Etiqueta, OrdenCafes } from '../../models/Cafe';
import { AuthService } from '../../services/auth.service';
import { CafeService } from '../../services/cafe.service';
import { FiltrosCafesService } from '../../services/filtros-cafes.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { ETIQUETA_LABEL, GRUPOS_ETIQUETAS, COSTOS_CON_NOMBRE, TODAS_LAS_ETIQUETAS } from '../../utils/etiquetas';
import { mensajeError } from '../../utils/errores';
import { Subject, debounceTime, map } from 'rxjs';

/** RF4, RF5, RF6, RF7 y RF24: listado de cafés con filtros, orden y café sorpresa. */
@Component({
  selector: 'app-cafe-list',
  imports: [FormsModule, RouterLink, CafeCard, EstadoVacio],
  templateUrl: './cafe-list.html',
  styleUrl: './cafe-list.css',
})
export class CafeList implements OnInit {
  etiquetaLabel = ETIQUETA_LABEL;
  cafes = signal<Cafe[]>([]);
  cargando = signal(true);
  error = signal('');
  sorteando = signal(false);
  filtrosAbiertos = signal(false);

  grupos = GRUPOS_ETIQUETAS;
  costos = COSTOS_CON_NOMBRE;

  // Filtros: signals (el nombre usa Two-Way Data Binding con ngModel)
  nombre = signal('');
  costo = signal<CostoPromedio | ''>('');
  etiquetas = signal<Etiqueta[]>([]);
  orden = signal<OrdenCafes>('nombre');

  /** Cada letra que se escribe en el buscador pasa por acá (ver el constructor). */
  private busqueda$ = new Subject<string>();
  /** Número del último pedido de cafés: sirve para descartar respuestas viejas que lleguen tarde. */
  private ultimoPedido = 0;

  cantidadFiltros = computed(() => (this.nombre().trim() ? 1 : 0) + (this.costo() ? 1 : 0) + this.etiquetas().length);

  constructor(
    public auth: AuthService,
    private cafeService: CafeService,
    private notificaciones: NotificacionesService,
    private router: Router,
    private route: ActivatedRoute, // sirve para leer los filtros de la URL (?costo=$$&etiquetas=...)
    private filtrosCafes: FiltrosCafesService,
  ) {
    // Buscar mientras escribís: espera 300 ms sin teclear y recién ahí pide los cafés.
    // takeUntilDestroyed corta la suscripción cuando se sale de la página.
    this.busqueda$
      .pipe(
        map((texto) => texto.trim()),
        debounceTime(300),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.traerCafes());
  }

  ngOnInit(): void {
    this.leerFiltrosDeUrl();
    this.traerCafes();
  }

  /** Se llama desde el input del buscador en cada cambio. */
  escribirNombre(texto: string) {
    this.busqueda$.next(texto);
  }

  traerCafes() {
    this.guardarFiltrosEnUrl();
    this.cargando.set(true);
    this.error.set('');
    const pedido = ++this.ultimoPedido;
    this.cafeService
      .getCafes({ nombre: this.nombre().trim(), costo: this.costo(), etiquetas: this.etiquetas(), orden: this.orden() })
      .subscribe({
        next: (data) => {
          if (pedido !== this.ultimoPedido) return; // llegó tarde: ya hay una búsqueda más nueva
          this.cafes.set(data);
          this.cargando.set(false);
        },
        error: (e) => {
          if (pedido !== this.ultimoPedido) return;
          this.error.set(mensajeError(e));
          this.cargando.set(false);
        },
      });
  }

  alternarEtiqueta(e: Etiqueta) {
    this.etiquetas.update((lista) => (lista.includes(e) ? lista.filter((x) => x !== e) : [...lista, e]));
    this.traerCafes();
  }

  alternarCosto(c: CostoPromedio) {
    this.costo.update((actual) => (actual === c ? '' : c));
    this.traerCafes();
  }

  /** RF7: el orden lo resuelve el backend (?orden=). */
  cambiarOrden(valor: OrdenCafes) {
    this.orden.set(valor);
    this.traerCafes();
  }

  limpiar() {
    this.nombre.set('');
    this.costo.set('');
    this.etiquetas.set([]);
    this.traerCafes();
  }

  /** Carga los filtros desde la URL. Ignora valores inválidos (por ejemplo, una etiqueta que no existe). */
  private leerFiltrosDeUrl() {
    const q = this.route.snapshot.queryParamMap;
    this.nombre.set(q.get('nombre') ?? '');

    const costo = q.get('costo');
    this.costo.set(this.costos.some((c) => c.valor === costo) ? (costo as CostoPromedio) : '');

    const etiquetas = (q.get('etiquetas') ?? '')
      .split(',')
      .filter((e): e is Etiqueta => TODAS_LAS_ETIQUETAS.includes(e as Etiqueta));
    this.etiquetas.set(etiquetas);

    const orden = q.get('orden');
    this.orden.set(orden === 'puntuacion' || orden === 'costo' ? orden : 'nombre');
  }

  /** Escribe los filtros en la URL (sin sumar pasos al historial) y los recuerda para "Volver a explorar". */
  private guardarFiltrosEnUrl() {
    const queryParams: Params = {
      nombre: this.nombre().trim() || null, // null = el parámetro no aparece en la URL
      costo: this.costo() || null,
      etiquetas: this.etiquetas().length ? this.etiquetas().join(',') : null,
      orden: this.orden() !== 'nombre' ? this.orden() : null,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
    this.filtrosCafes.ultimos.set(Object.fromEntries(Object.entries(queryParams).filter(([, v]) => v !== null)));
  }

  /** RF24: un café al azar entre los que cumplen los filtros actuales. */
  sorpresa() {
    this.sorteando.set(true);
    this.cafeService
      .getCafeAleatorio({ nombre: this.nombre().trim(), costo: this.costo(), etiquetas: this.etiquetas() })
      .subscribe({
        next: (cafe) => {
          this.notificaciones.info(`Hoy te toca: ${cafe.nombre}`);
          this.router.navigate(['/cafes', cafe.id]);
        },
        error: (e) => {
          this.notificaciones.error(mensajeError(e));
          this.sorteando.set(false);
        },
      });
  }
}

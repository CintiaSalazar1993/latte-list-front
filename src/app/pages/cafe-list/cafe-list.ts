import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CafeCard } from '../../components/cafe-card/cafe-card';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Cafe, CostoPromedio, Etiqueta, OrdenCafes } from '../../models/Cafe';
import { AuthService } from '../../services/auth.service';
import { CafeService } from '../../services/cafe.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { ETIQUETA_LABEL, GRUPOS_ETIQUETAS, COSTOS_CON_NOMBRE } from '../../utils/etiquetas';
import { mensajeError } from '../../utils/errores';

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

  cantidadFiltros = computed(() => (this.nombre().trim() ? 1 : 0) + (this.costo() ? 1 : 0) + this.etiquetas().length);

  constructor(
    public auth: AuthService,
    private cafeService: CafeService,
    private notificaciones: NotificacionesService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.traerCafes();
  }

  traerCafes() {
    this.cargando.set(true);
    this.error.set('');
    this.cafeService
      .getCafes({ nombre: this.nombre().trim(), costo: this.costo(), etiquetas: this.etiquetas(), orden: this.orden() })
      .subscribe({
        next: (data) => {
          this.cafes.set(data);
          this.cargando.set(false);
        },
        error: (e) => {
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

import { formatearNumero } from '../../utils/formato';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Costo } from '../../components/costo/costo';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { TazaLogo } from '../../components/taza-logo/taza-logo';
import { Cafe } from '../../models/Cafe';
import { CafeService } from '../../services/cafe.service';
import { ConfirmService } from '../../services/confirm.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { mensajeError } from '../../utils/errores';


type Columna = 'nombre' | 'duenioNombre' | 'puntuacionPromedio' | 'cantidadResenas';

/** RF16: el ADMIN da de alta cafés a nombre de un dueño y da de baja cualquier café. */
@Component({
  selector: 'app-admin-cafes',
  imports: [FormsModule, RouterLink, TazaLogo, Costo, EstadoVacio],
  templateUrl: './admin-cafes.html',
  styleUrl: './admin-cafes.css',
})
export class AdminCafes implements OnInit {
  formatearNumero = formatearNumero;
  cafes = signal<Cafe[]>([]);
  cargando = signal(true);
  busqueda = signal('');
  orden = signal<{ col: Columna; asc: boolean }>({ col: 'nombre', asc: true });

  /** Búsqueda y orden de la tabla (por nombre, dirección o dueño). */
  visibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const { col, asc } = this.orden();
    return this.cafes()
      .filter((c) => !q || [c.nombre, c.direccion, c.duenioNombre].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => {
        const va = a[col] ?? -1;
        const vb = b[col] ?? -1;
        const r = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
        return asc ? r : -r;
      });
  });

  constructor(
    private cafeService: CafeService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.traerCafes();
  }

  traerCafes() {
    this.cafeService.getCafes().subscribe({
      next: (data) => {
        this.cafes.set(data);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificaciones.error(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  ordenarPor(col: Columna) {
    this.orden.update((o) => (o.col === col ? { col, asc: !o.asc } : { col, asc: col === 'nombre' || col === 'duenioNombre' }));
  }

  flecha(col: Columna): string {
    const o = this.orden();
    return o.col !== col ? '' : o.asc ? '▲' : '▼';
  }

  ariaSort(col: Columna): string | null {
    const o = this.orden();
    return o.col !== col ? null : o.asc ? 'ascending' : 'descending';
  }

  async eliminar(cafe: Cafe) {
    const ok = await this.confirm.preguntar({
      titulo: 'Dar de baja el café',
      mensaje: `Se va a eliminar "${cafe.nombre}" (de ${cafe.duenioNombre}) con sus ${cafe.cantidadResenas} reseñas.`,
      textoConfirmar: 'Dar de baja',
      peligroso: true,
    });
    if (!ok) return;
    this.cafeService.deleteCafe(cafe.id).subscribe({
      next: () => {
        this.notificaciones.ok(`"${cafe.nombre}" dado de baja`);
        this.traerCafes();
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }
}

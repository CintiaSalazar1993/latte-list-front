
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Granos } from '../../components/granos/granos';
import { Cafe } from '../../models/Cafe';
import { Resena } from '../../models/Resena';
import { CafeService } from '../../services/cafe.service';
import { ConfirmService } from '../../services/confirm.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { ResenaService } from '../../services/resena.service';
import { mensajeError } from '../../utils/errores';
import { formatearFecha } from '../../utils/formato';

/** RF27 (ver y filtrar todas las reseñas) y RF22 (baja de reseñas). Solo ADMIN. */
@Component({
  selector: 'app-admin-resenas',
  imports: [FormsModule, RouterLink, Granos, EstadoVacio],
  templateUrl: './admin-resenas.html',
  styleUrl: './admin-resenas.css',
})
export class AdminResenas implements OnInit {
  formatearFecha = formatearFecha;
  resenas = signal<Resena[]>([]);
  cafes = signal<Cafe[]>([]);
  cargando = signal(true);

  // Filtros (ngModel sobre signals). 0 = sin filtro.
  cafeId = signal(0);
  puntajeMin = signal(0);
  puntajeMax = signal(0);
  puntajes = [1, 2, 3, 4, 5];

  constructor(
    private resenaService: ResenaService,
    private cafeService: CafeService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.cafeService.getCafes().subscribe({
      next: (data) => this.cafes.set(data),
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
    this.traerResenas();
  }

  traerResenas() {
    this.cargando.set(true);
    this.resenaService
      .getTodasLasResenas({
        cafeId: Number(this.cafeId()),
        puntajeMin: Number(this.puntajeMin()),
        puntajeMax: Number(this.puntajeMax()),
      })
      .subscribe({
        next: (data) => {
          this.resenas.set(data);
          this.cargando.set(false);
        },
        error: (e) => {
          this.notificaciones.error(mensajeError(e));
          this.cargando.set(false);
        },
      });
  }

  limpiar() {
    this.cafeId.set(0);
    this.puntajeMin.set(0);
    this.puntajeMax.set(0);
    this.traerResenas();
  }

  async eliminar(resena: Resena) {
    const ok = await this.confirm.preguntar({
      titulo: 'Eliminar reseña',
      mensaje: `Se va a eliminar la reseña de ${resena.autor} sobre "${resena.cafeNombre}".`,
      textoConfirmar: 'Eliminar reseña',
      peligroso: true,
    });
    if (!ok) return;
    this.resenaService.deleteResena(resena.id).subscribe({
      next: () => {
        this.notificaciones.ok('Reseña eliminada');
        this.traerResenas();
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }
}

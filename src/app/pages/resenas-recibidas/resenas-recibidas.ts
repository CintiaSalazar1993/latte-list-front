import { formatearFecha, formatearNumero } from '../../utils/formato';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Granos } from '../../components/granos/granos';
import { Resena } from '../../models/Resena';
import { NotificacionesService } from '../../services/notificaciones.service';
import { ResenaService } from '../../services/resena.service';
import { mensajeError } from '../../utils/errores';

/** RF26: el dueño ve las reseñas que reciben sus cafés. */
@Component({
  selector: 'app-resenas-recibidas',
  imports: [RouterLink, FormsModule, Granos, EstadoVacio],
  templateUrl: './resenas-recibidas.html',
  styleUrl: './resenas-recibidas.css',
})
export class ResenasRecibidas implements OnInit {
  formatearFecha = formatearFecha;
  formatearNumero = formatearNumero;
  resenas = signal<Resena[]>([]);
  cargando = signal(true);
  cafeElegido = signal(0); // 0 = todos los cafés

  // cafes que tienen reseñas (para el filtro) y reseñas visibles según el filtro
  cafes = computed(() => {
    const mapa = new Map<number, string>();
    for (const r of this.resenas()) mapa.set(r.cafeId, r.cafeNombre);
    return [...mapa].map(([id, nombre]) => ({ id, nombre }));
  });
  visibles = computed(() => {
    const id = Number(this.cafeElegido());
    return id ? this.resenas().filter((r) => r.cafeId === id) : this.resenas();
  });
  promedio = computed(() => {
    const r = this.visibles();
    return r.length ? r.reduce((s, x) => s + x.puntuacionGeneral, 0) / r.length : 0;
  });

  constructor(private resenaService: ResenaService, private notificaciones: NotificacionesService) {}

  ngOnInit(): void {
    this.resenaService.getResenasRecibidas().subscribe({
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
}

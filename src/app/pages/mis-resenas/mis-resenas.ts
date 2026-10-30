import { NgClass } from '@angular/common';
import { formatearFecha, formatearNumero } from '../../utils/formato';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Granos } from '../../components/granos/granos';
import { Modal } from '../../components/modal/modal';
import { SelectorGranos } from '../../components/selector-granos/selector-granos';
import { Resena } from '../../models/Resena';
import { ConfirmService } from '../../services/confirm.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { ResenaService } from '../../services/resena.service';
import { mensajeError } from '../../utils/errores';

/** RF9 (ver mis reseñas), RF8 (baja) y RF23 (editar una reseña propia). */
@Component({
  selector: 'app-mis-resenas',
  imports: [RouterLink, NgClass, ReactiveFormsModule, Granos, EstadoVacio, Modal, SelectorGranos],
  templateUrl: './mis-resenas.html',
  styleUrl: './mis-resenas.css',
})
export class MisResenas implements OnInit {
  formatearFecha = formatearFecha;
  formatearNumero = formatearNumero;
  resenas = signal<Resena[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  /** Reseña que se está editando (null = modal cerrado). */
  editando = signal<Resena | null>(null);

  promedio = computed(() => {
    const r = this.resenas();
    return r.length ? r.reduce((s, x) => s + x.puntuacionGeneral, 0) / r.length : 0;
  });
  cafesDistintos = computed(() => new Set(this.resenas().map((r) => r.cafeId)).size);

  private puntaje = [Validators.required, Validators.min(1), Validators.max(5)];
  form = new FormGroup({
    puntuacionGeneral: new FormControl(0, this.puntaje),
    puntuacionPrecio: new FormControl(0, this.puntaje),
    puntuacionAtencion: new FormControl(0, this.puntaje),
    comentario: new FormControl('', [Validators.required, Validators.maxLength(255)]),
  });

  constructor(
    private resenaService: ResenaService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.traerResenas();
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  traerResenas() {
    this.resenaService.getMisResenas().subscribe({
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

  /** RF23: trae el detalle (con los tres puntajes) y abre el formulario de edición. */
  editar(resena: Resena) {
    this.resenaService.getResenaById(resena.id).subscribe({
      next: (detalle) => {
        this.form.reset({
          puntuacionGeneral: detalle.puntuacionGeneral,
          puntuacionPrecio: detalle.puntuacionPrecio,
          puntuacionAtencion: detalle.puntuacionAtencion,
          comentario: detalle.comentario,
        });
        this.editando.set(resena);
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }

  cerrarModal() {
    this.editando.set(null);
  }

  guardar() {
    const resena = this.editando();
    if (!resena) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.guardando.set(true);
    this.resenaService
      .putResena(resena.id, {
        puntuacionGeneral: v.puntuacionGeneral ?? 1,
        puntuacionPrecio: v.puntuacionPrecio ?? 1,
        puntuacionAtencion: v.puntuacionAtencion ?? 1,
        comentario: (v.comentario ?? '').trim(),
      })
      .subscribe({
        next: () => {
          this.notificaciones.ok('Reseña actualizada');
          this.editando.set(null);
          this.guardando.set(false);
          this.traerResenas();
        },
        error: (e) => {
          this.notificaciones.error(mensajeError(e));
          this.guardando.set(false);
        },
      });
  }

  async eliminar(resena: Resena) {
    const ok = await this.confirm.preguntar({
      titulo: 'Eliminar reseña',
      mensaje: `Se va a eliminar tu reseña de "${resena.cafeNombre}".`,
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

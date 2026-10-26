import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Modal } from '../../components/modal/modal';
import { TazaLogo } from '../../components/taza-logo/taza-logo';
import { Lista } from '../../models/Lista';
import { ConfirmService } from '../../services/confirm.service';
import { ListaService } from '../../services/lista.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { mensajeError } from '../../utils/errores';

/** CRUD de listas del CLIENTE (RF10, RF12, RF13). */
@Component({
  selector: 'app-listas',
  imports: [RouterLink, ReactiveFormsModule, NgClass, DatePipe, Modal, TazaLogo, EstadoVacio],
  templateUrl: './listas.html',
  styleUrl: './listas.css',
})
export class Listas implements OnInit {
  listas = signal<Lista[]>([]);
  cargando = signal(true);
  guardando = signal(false);

  /** null = modal cerrado; 'nueva' = alta; Lista = renombrar */
  editando = signal<Lista | 'nueva' | null>(null);

  // favoritos siempre primero
  ordenadas = computed(() => [...this.listas()].sort((a, b) => Number(b.favoritos) - Number(a.favoritos)));

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.maxLength(50)]),
  });

  constructor(
    private listaService: ListaService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.traerListas();
  }

  invalido(): boolean {
    const c = this.form.controls.nombre;
    return c.invalid && c.touched;
  }

  traerListas() {
    this.listaService.getListas().subscribe({
      next: (data) => {
        this.listas.set(data);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificaciones.error(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  abrirNueva() {
    this.form.reset({ nombre: '' });
    this.editando.set('nueva');
  }

  abrirRenombrar(lista: Lista) {
    this.form.reset({ nombre: lista.nombre });
    this.editando.set(lista);
  }

  tituloModal(): string {
    return this.editando() === 'nueva' ? 'Nueva lista' : 'Renombrar lista';
  }

  cerrarModal() {
    this.editando.set(null);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const actual = this.editando();
    const nombre = (this.form.value.nombre ?? '').trim();
    this.guardando.set(true);
    const peticion =
      actual === 'nueva' || actual === null
        ? this.listaService.postLista(nombre)
        : this.listaService.putLista(actual.id, nombre);

    peticion.subscribe({
      next: () => {
        this.notificaciones.ok(actual === 'nueva' ? `Creaste la lista "${nombre}"` : 'Lista renombrada');
        this.editando.set(null);
        this.guardando.set(false);
        this.traerListas();
      },
      error: (e) => {
        this.notificaciones.error(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }

  async eliminar(lista: Lista) {
    const ok = await this.confirm.preguntar({
      titulo: 'Eliminar lista',
      mensaje: `Se va a eliminar "${lista.nombre}". Los cafés no se borran, solo la lista.`,
      textoConfirmar: 'Eliminar lista',
      peligroso: true,
    });
    if (!ok) return;
    this.listaService.deleteLista(lista.id).subscribe({
      next: () => {
        this.notificaciones.ok('Lista eliminada');
        this.traerListas();
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }
}

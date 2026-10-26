import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

/**
 * Modal basado en el <dialog> nativo (maneja foco, Escape y fondo).
 * Se abre y cierra con el input [abierto]; avisa al padre con el output (cerrar).
 */
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  private static contador = 0;
  idTitulo = `modal-titulo-${Modal.contador++}`;

  abierto = input(false);
  titulo = input.required<string>();
  cerrar = output<void>();

  dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    effect(() => {
      const d = this.dialogo().nativeElement;
      if (this.abierto() && !d.open) d.showModal();
      if (!this.abierto() && d.open) d.close();
    });
  }

  clickFondo(e: MouseEvent) {
    if (e.target === this.dialogo().nativeElement) this.cerrar.emit();
  }
}

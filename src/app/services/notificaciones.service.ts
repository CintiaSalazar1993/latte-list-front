import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  tipo: 'ok' | 'error' | 'info';
  texto: string;
}

/** Avisos cortos ("toasts") para confirmar acciones o mostrar errores. */
@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  avisos = signal<Aviso[]>([]);
  private contador = 0;

  ok(texto: string) {
    this.agregar('ok', texto);
  }

  error(texto: string) {
    this.agregar('error', texto, 6500);
  }

  info(texto: string) {
    this.agregar('info', texto);
  }

  cerrar(id: number) {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }

  private agregar(tipo: 'ok' | 'error' | 'info', texto: string, duracion = 4200) {
    const id = ++this.contador;
    this.avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.cerrar(id), duracion);
  }
}

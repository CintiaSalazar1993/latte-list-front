import { Injectable, signal } from '@angular/core';

export interface PedidoConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  peligroso?: boolean;
}

interface PedidoActivo extends PedidoConfirmacion {
  resolver: (ok: boolean) => void;
}

/**
 * Diálogo de confirmación propio (reemplaza a window.confirm).
 * Uso: if (await this.confirm.preguntar({...})) { ... }
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly activo = signal<PedidoActivo | null>(null);

  preguntar(pedido: PedidoConfirmacion): Promise<boolean> {
    this.activo()?.resolver(false);
    return new Promise((resolver) => this.activo.set({ ...pedido, resolver }));
  }

  responder(ok: boolean): void {
    const pedido = this.activo();
    this.activo.set(null);
    pedido?.resolver(ok);
  }
}

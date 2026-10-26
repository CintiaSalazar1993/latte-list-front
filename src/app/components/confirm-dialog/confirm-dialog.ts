import { Component, computed } from '@angular/core';
import { ConfirmService } from '../../services/confirm.service';
import { Modal } from '../modal/modal';

/** Se monta una sola vez en App y responde a ConfirmService.preguntar(). */
@Component({
  selector: 'app-confirm-dialog',
  imports: [Modal],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  pedido = computed(() => this.confirm.activo());

  constructor(public confirm: ConfirmService) {}
}

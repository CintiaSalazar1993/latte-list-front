import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificacionesService } from '../../services/notificaciones.service';

@Component({
  selector: 'app-toasts',
  imports: [NgClass],
  templateUrl: './toasts.html',
  styleUrl: './toasts.css',
})
export class Toasts {
  constructor(public notificaciones: NotificacionesService) {}
}

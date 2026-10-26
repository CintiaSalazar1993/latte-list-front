import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  etiquetasEjemplo = [
    'Frente al mar',
    'Café de especialidad',
    'Wi-Fi',
    'Pet friendly',
    'Sin TACC',
    'Para trabajar',
    'Brunch',
    'Música en vivo',
  ];
}

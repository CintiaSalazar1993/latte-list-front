import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
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

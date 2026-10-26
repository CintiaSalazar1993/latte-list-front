import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from './components/confirm-dialog/confirm-dialog';
import { Navbar } from './components/navbar/navbar';
import { Toasts } from './components/toasts/toasts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Toasts, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

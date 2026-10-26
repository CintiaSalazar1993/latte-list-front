import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { mensajeError } from '../../utils/errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './login.html',
  styleUrl: '../auth.css',
})
export class Login {
  cargando = signal(false);
  error = signal('');
  verPass = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    contrasena: new FormControl('', [Validators.required]),
  });

  constructor(private auth: AuthService, private router: Router) {}

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    const { email, contrasena } = this.form.value;

    this.auth.login(email ?? '', contrasena ?? '').subscribe({
      next: () => {
        this.router.navigateByUrl(this.auth.inicioPorRol());
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }
}

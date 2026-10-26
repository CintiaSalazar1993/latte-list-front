import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TipoDeUsuario } from '../../models/Usuario';
import { AuthService } from '../../services/auth.service';
import { mensajeError } from '../../utils/errores';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, NgClass],
  templateUrl: './registro.html',
  styleUrl: '../auth.css',
})
export class Registro implements OnInit {
  cargando = signal(false);
  error = signal('');

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    contrasena: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    tipoDeUsuario: new FormControl<TipoDeUsuario>('CLIENTE'),
  });

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // La landing manda /registro?tipo=DUENIO: preselecciona el tipo de cuenta
    const tipo = this.route.snapshot.queryParamMap.get('tipo');
    if (tipo === 'CLIENTE' || tipo === 'DUENIO') this.form.patchValue({ tipoDeUsuario: tipo });
  }

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
    const v = this.form.value;

    this.auth
      .registrar({
        nombre: v.nombre ?? '',
        apellido: v.apellido ?? '',
        email: v.email ?? '',
        contrasena: v.contrasena ?? '',
        tipoDeUsuario: v.tipoDeUsuario ?? 'CLIENTE',
      })
      .subscribe({
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

import { Component, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolPipe } from '../../pipes/etiqueta.pipe';
import { ConfirmService } from '../../services/confirm.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { mensajeError } from '../../utils/errores';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, NgClass, DatePipe, RolPipe],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  guardando = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    contrasena: new FormControl('', [Validators.minLength(6), Validators.maxLength(20)]),
  });

  constructor(
    public auth: AuthService,
    private usuarioService: UsuarioService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {
    // Cargo en el formulario los datos actuales del usuario logueado
    this.form.patchValue({ nombre: this.auth.usuario()?.nombre ?? '', apellido: this.auth.usuario()?.apellido ?? '' });
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
    const v = this.form.value;
    this.guardando.set(true);
    this.usuarioService.putYo({ nombre: v.nombre ?? '', apellido: v.apellido ?? '', contrasena: v.contrasena || undefined }).subscribe({
      next: (usuario) => {
        this.auth.actualizarUsuario(usuario);
        this.form.controls.contrasena.reset('');
        this.notificaciones.ok('Perfil actualizado');
        this.guardando.set(false);
      },
      error: (e) => {
        this.notificaciones.error(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }

  async eliminarCuenta() {
    const ok = await this.confirm.preguntar({
      titulo: 'Eliminar mi cuenta',
      mensaje: 'Se va a eliminar tu cuenta con todos tus datos. Esta acción es definitiva.',
      textoConfirmar: 'Eliminar mi cuenta',
      peligroso: true,
    });
    if (!ok) return;
    this.usuarioService.deleteYo().subscribe({
      next: () => {
        this.notificaciones.ok('Cuenta eliminada');
        this.auth.salir();
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }
}

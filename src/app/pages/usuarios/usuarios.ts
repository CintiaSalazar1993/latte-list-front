import { NgClass } from '@angular/common';
import { formatearFecha } from '../../utils/formato';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoVacio } from '../../components/estado-vacio/estado-vacio';
import { Modal } from '../../components/modal/modal';
import { ROLES_LABEL, TipoDeUsuario, Usuario } from '../../models/Usuario';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { mensajeError } from '../../utils/errores';


/** RF19, RF20 y RF21: gestión de usuarios (alta, listado con filtros, detalle y baja). Solo ADMIN. */
@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, ReactiveFormsModule, NgClass, Modal, EstadoVacio],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  rolLabel = ROLES_LABEL;
  formatearFecha = formatearFecha;
  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  creando = signal(false);
  guardando = signal(false);
  detalle = signal<Usuario | null>(null);

  // Filtros (el nombre usa Two-Way Data Binding con ngModel)
  texto = signal('');
  tipo = signal<TipoDeUsuario | ''>('');
  tipos: { valor: TipoDeUsuario | ''; texto: string }[] = [
    { valor: '', texto: 'Todos' },
    { valor: 'CLIENTE', texto: 'Clientes' },
    { valor: 'DUENIO', texto: 'Dueños' },
    { valor: 'ADMIN', texto: 'Admins' },
  ];

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    contrasena: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    tipoDeUsuario: new FormControl<TipoDeUsuario>('CLIENTE', Validators.required),
  });

  constructor(
    public auth: AuthService,
    private usuarioService: UsuarioService,
    private notificaciones: NotificacionesService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.traerUsuarios();
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  /** RF20 y RF21: el filtro lo resuelve el backend (GET /api/usuarios?texto=&tipo=). */
  traerUsuarios() {
    this.cargando.set(true);
    this.usuarioService.getUsuarios(this.texto().trim(), this.tipo()).subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: (e) => {
        this.notificaciones.error(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }

  elegirTipo(valor: TipoDeUsuario | '') {
    this.tipo.set(valor);
    this.traerUsuarios();
  }

  abrirAlta() {
    this.form.reset({ nombre: '', apellido: '', email: '', contrasena: '', tipoDeUsuario: 'CLIENTE' });
    this.creando.set(true);
  }

  cerrarAlta() {
    this.creando.set(false);
  }

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.guardando.set(true);
    this.usuarioService
      .postUsuario({
        nombre: (v.nombre ?? '').trim(),
        apellido: (v.apellido ?? '').trim(),
        email: (v.email ?? '').trim(),
        contrasena: v.contrasena ?? '',
        tipoDeUsuario: v.tipoDeUsuario ?? 'CLIENTE',
      })
      .subscribe({
        next: (u) => {
          this.notificaciones.ok(`Creaste a ${u.nombre} ${u.apellido}`);
          this.creando.set(false);
          this.guardando.set(false);
          this.traerUsuarios();
        },
        error: (e) => {
          this.notificaciones.error(mensajeError(e));
          this.guardando.set(false);
        },
      });
  }

  /** GET /api/usuarios/{id} */
  verDetalle(usuario: Usuario) {
    this.usuarioService.getUsuarioById(usuario.id).subscribe({
      next: (d) => this.detalle.set(d),
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }

  cerrarDetalle() {
    this.detalle.set(null);
  }

  esYo(usuario: Usuario): boolean {
    return usuario.id === this.auth.usuario()?.id;
  }

  async eliminar(usuario: Usuario) {
    const consecuencia =
      usuario.tipoDeUsuario === 'DUENIO'
        ? ' También se eliminan sus cafés y las reseñas de esos cafés.'
        : usuario.tipoDeUsuario === 'CLIENTE'
          ? ' También se eliminan sus listas y reseñas.'
          : '';
    const ok = await this.confirm.preguntar({
      titulo: 'Eliminar usuario',
      mensaje: `Se va a eliminar a ${usuario.nombre} ${usuario.apellido} (${usuario.email}).${consecuencia}`,
      textoConfirmar: 'Eliminar usuario',
      peligroso: true,
    });
    if (!ok) return;
    this.usuarioService.deleteUsuario(usuario.id).subscribe({
      next: () => {
        this.notificaciones.ok('Usuario eliminado');
        this.detalle.set(null);
        this.traerUsuarios();
      },
      error: (e) => this.notificaciones.error(mensajeError(e)),
    });
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TazaLogo } from '../../components/taza-logo/taza-logo';
import { CafeRequest, CostoPromedio, Etiqueta } from '../../models/Cafe';
import { EtiquetaPipe } from '../../pipes/etiqueta.pipe';
import { Usuario } from '../../models/Usuario';
import { AuthService } from '../../services/auth.service';
import { CafeService } from '../../services/cafe.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { mensajeError } from '../../utils/errores';
import { COSTOS_CON_NOMBRE, GRUPOS_ETIQUETAS } from '../../utils/etiquetas';

// Mismas reglas que valida el backend
const RE_DIRECCION = /^[\p{L}][\p{L}\s.]*\s\d+$/u;
const RE_LOGO = /^(https?:\/\/).+\.(png|jpg|jpeg|svg|webp)$/;
const RE_INSTAGRAM = /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/;

/** Sirve para crear (/cafes/nuevo) y para editar (/cafes/:id/editar) un café. */
@Component({
  selector: 'app-cafe-form',
  imports: [ReactiveFormsModule, RouterLink, NgClass, TazaLogo, EtiquetaPipe],
  templateUrl: './cafe-form.html',
  styleUrl: './cafe-form.css',
})
export class CafeForm implements OnInit {
  idCafe: number | null = null; // null = alta, con valor = edición
  costos = COSTOS_CON_NOMBRE;
  grupos = GRUPOS_ETIQUETAS;
  cargando = signal(false);
  etiquetas = signal<Etiqueta[]>([]);
  duenios = signal<Usuario[]>([]);
  error = signal('');
  guardando = signal(false);
  intentado = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    direccion: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60), Validators.pattern(RE_DIRECCION)]),
    costoPromedio: new FormControl<CostoPromedio>('$', [Validators.required]),
    logo: new FormControl('', [Validators.pattern(RE_LOGO)]),
    instagramUrl: new FormControl('', [Validators.pattern(RE_INSTAGRAM)]),
    idDuenio: new FormControl<number | null>(null), // solo lo usa el ADMIN al crear
  });

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cafeService: CafeService,
    private usuarioService: UsuarioService,
    private notificaciones: NotificacionesService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.idCafe = id ? Number(id) : null;

    if (this.idCafe !== null) {
      // Edición: traigo el café y relleno el formulario con patchValue
      this.cargando.set(true);
      this.cafeService.getCafeById(this.idCafe).subscribe({
        next: (c) => {
          if (c.duenioId !== this.auth.usuario()?.id) {
            this.notificaciones.error('Solo podés editar tus propios cafés.');
            this.router.navigate(['/mis-cafes']);
            return;
          }
          this.form.patchValue({
            nombre: c.nombre,
            direccion: c.direccion,
            costoPromedio: c.costoPromedio,
            logo: c.logo ?? '',
            instagramUrl: c.instagramUrl ?? '',
          });
          this.etiquetas.set([...c.etiquetas]);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(mensajeError(e));
          this.cargando.set(false);
        },
      });
    } else if (this.auth.tieneRol('ADMIN')) {
      // Alta hecha por el ADMIN: debe elegir a qué dueño pertenece el café
      this.form.controls.idDuenio.addValidators(Validators.required);
      this.usuarioService.getUsuarios('', 'DUENIO').subscribe({
        next: (data) => this.duenios.set(data),
        error: (e) => this.notificaciones.error(mensajeError(e)),
      });
    }
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  alternarEtiqueta(e: Etiqueta) {
    this.etiquetas.update((lista) => (lista.includes(e) ? lista.filter((x) => x !== e) : [...lista, e]));
  }

  /** Para la vista previa del logo. */
  logoValido(): boolean {
    return RE_LOGO.test(this.form.value.logo ?? '');
  }

  volver(): string {
    return this.auth.tieneRol('ADMIN') ? '/admin/cafes' : '/mis-cafes';
  }

  onSubmit() {
    this.intentado.set(true);
    if (this.form.invalid || this.etiquetas().length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const cafe: CafeRequest = {
      nombre: (v.nombre ?? '').trim(),
      direccion: (v.direccion ?? '').trim(),
      costoPromedio: v.costoPromedio ?? '$',
      logo: (v.logo ?? '').trim() || null,
      instagramUrl: (v.instagramUrl ?? '').trim() || null,
      etiquetas: this.etiquetas(),
      idDuenio: this.auth.tieneRol('ADMIN') ? v.idDuenio : null,
    };

    this.guardando.set(true);
    this.error.set('');
    const peticion = this.idCafe !== null ? this.cafeService.putCafe(this.idCafe, cafe) : this.cafeService.postCafe(cafe);

    peticion.subscribe({
      next: (guardado) => {
        this.notificaciones.ok(this.idCafe !== null ? 'Café actualizado' : 'Café creado');
        this.router.navigate(['/cafes', guardado.id]);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}

import { Component, HostListener, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TazaLogo } from '../../components/taza-logo/taza-logo';
import { CafeRequest, CostoPromedio, Etiqueta } from '../../models/Cafe';
import { Usuario } from '../../models/Usuario';
import { AuthService } from '../../services/auth.service';
import { CafeService } from '../../services/cafe.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { UsuarioService } from '../../services/usuario.service';
import { mensajeError } from '../../utils/errores';
import { COSTOS_CON_NOMBRE, ETIQUETA_LABEL, GRUPOS_ETIQUETAS } from '../../utils/etiquetas';
import { achicarImagen } from '../../utils/imagen';

// Mismas reglas que valida el backend
// Calle (puede empezar con número, ej: "14 de Julio") seguida de la altura
const RE_DIRECCION = /^[\p{L}\d][\p{L}\d\s.]*\s\d+$/u;
// Logo: un link (http/https) o una imagen subida, guardada como texto base64
const RE_LOGO = /^(https?:\/\/\S+|data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/;
const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_MB = 10;
const RE_INSTAGRAM = /^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/;

/** Sirve para crear (/cafes/nuevo) y para editar (/cafes/:id/editar) un café. */
@Component({
  selector: 'app-cafe-form',
  imports: [ReactiveFormsModule, RouterLink, NgClass, TazaLogo],
  templateUrl: './cafe-form.html',
  styleUrl: './cafe-form.css',
})
export class CafeForm implements OnInit {
  etiquetaLabel = ETIQUETA_LABEL;
  idCafe: number | null = null; // null = alta, con valor = edición
  costos = COSTOS_CON_NOMBRE;
  grupos = GRUPOS_ETIQUETAS;
  cargando = signal(false);
  etiquetas = signal<Etiqueta[]>([]);
  duenios = signal<Usuario[]>([]);
  error = signal('');
  guardando = signal(false);
  intentado = signal(false);

  // Logo
  arrastrando = signal(false); // true mientras se arrastra un archivo encima de la zona
  procesandoLogo = signal(false);
  errorLogo = signal('');
  mostrarLink = signal(false); // campo opcional para pegar un link en vez de subir

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

  // ---------- Logo: elegir, arrastrar, pegar o link ----------

  /** true si el logo actual es un link (y no una imagen subida). */
  logoEsLink(): boolean {
    return /^https?:\/\//.test(this.form.value.logo ?? '');
  }

  alElegirArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) this.cargarImagen(archivo);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  alArrastrar(evento: DragEvent) {
    evento.preventDefault(); // sin esto, el navegador abre la imagen en vez de soltarla acá
    this.arrastrando.set(true);
  }

  alSoltar(evento: DragEvent) {
    evento.preventDefault();
    this.arrastrando.set(false);
    const archivo = evento.dataTransfer?.files?.[0];
    if (archivo) this.cargarImagen(archivo);
  }

  /** Ctrl + V en cualquier parte del formulario: si lo copiado es una imagen, la usa como logo. */
  @HostListener('document:paste', ['$event'])
  alPegar(evento: ClipboardEvent) {
    const archivo = Array.from(evento.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
    if (!archivo) return; // si es texto, se pega normalmente en el campo que tenga el foco
    evento.preventDefault();
    this.cargarImagen(archivo);
  }

  /** Link pegado a mano en el campo "Usar un link". */
  usarLink(texto: string) {
    this.errorLogo.set('');
    this.form.controls.logo.setValue(texto.trim());
    this.form.controls.logo.markAsTouched();
  }

  quitarLogo() {
    this.errorLogo.set('');
    this.form.controls.logo.setValue('');
  }

  private async cargarImagen(archivo: File) {
    this.errorLogo.set('');
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      this.errorLogo.set('Usá una imagen PNG, JPG o WEBP.');
      return;
    }
    if (archivo.size > MAX_MB * 1024 * 1024) {
      this.errorLogo.set(`La imagen pesa más de ${MAX_MB} MB.`);
      return;
    }
    this.procesandoLogo.set(true);
    try {
      this.form.controls.logo.setValue(await achicarImagen(archivo));
      this.form.controls.logo.markAsTouched();
      this.mostrarLink.set(false);
    } catch (e) {
      this.errorLogo.set(e instanceof Error ? e.message : 'No pudimos leer esa imagen.');
    } finally {
      this.procesandoLogo.set(false);
    }
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

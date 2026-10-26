import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from '../config';
import { AuthResponse } from '../models/AuthResponse';
import { TipoDeUsuario, Usuario, UsuarioRequest } from '../models/Usuario';

/**
 * Maneja la sesión: guarda el token JWT y el usuario logueado.
 * Es un Singleton (providedIn: 'root'): toda la app comparte la misma instancia.
 * El estado se guarda en signals: cuando cambian, la vista se actualiza sola.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = `${API_URL}/auth`;

  // ---------- Estado de la sesión (signals) ----------
  token = signal<string | null>(null);
  usuario = signal<Usuario | null>(null);

  // computed: se recalculan solas cuando cambian las signals de las que dependen
  logueado = computed(() => !!this.token() && !!this.usuario());
  rol = computed<TipoDeUsuario | null>(() => this.usuario()?.tipoDeUsuario ?? null);

  constructor(private http: HttpClient, private router: Router) {
    this.recuperarSesion();
  }

  tieneRol(...roles: TipoDeUsuario[]): boolean {
    const rol = this.rol();
    return rol !== null && roles.includes(rol);
  }

  /** Página de inicio según el rol. */
  inicioPorRol(): string {
    if (this.rol() === 'ADMIN') return '/dashboard';
    if (this.rol() === 'DUENIO') return '/mis-cafes';
    return '/cafes';
  }

  // ---------- Peticiones al backend ----------
  login(email: string, contrasena: string) {
    return this.http.post<AuthResponse>(`${this.url}/login`, { email, contrasena }).pipe(tap((r) => this.guardarSesion(r)));
  }

  registrar(usuario: UsuarioRequest) {
    return this.http.post<AuthResponse>(`${this.url}/register`, usuario).pipe(tap((r) => this.guardarSesion(r)));
  }

  // ---------- Sesión en localStorage ----------
  actualizarUsuario(usuario: Usuario) {
    this.usuario.set(usuario);
    localStorage.setItem('lattelist.usuario', JSON.stringify(usuario));
  }

  salir(redirigir = true) {
    this.token.set(null);
    this.usuario.set(null);
    localStorage.removeItem('lattelist.token');
    localStorage.removeItem('lattelist.usuario');
    if (redirigir) this.router.navigate(['/login']);
  }

  /** El backend respondió 401: el token venció o no es válido. */
  sesionExpirada() {
    if (this.logueado()) this.salir();
  }

  private guardarSesion(r: AuthResponse) {
    this.token.set(r.token);
    this.usuario.set(r.usuario);
    localStorage.setItem('lattelist.token', r.token);
    localStorage.setItem('lattelist.usuario', JSON.stringify(r.usuario));
  }

  private recuperarSesion() {
    try {
      this.token.set(localStorage.getItem('lattelist.token'));
      const guardado = localStorage.getItem('lattelist.usuario');
      this.usuario.set(guardado ? (JSON.parse(guardado) as Usuario) : null);
    } catch {
      this.token.set(null);
      this.usuario.set(null);
    }
  }
}

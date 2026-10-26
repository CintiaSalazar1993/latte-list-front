import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../config';
import { TipoDeUsuario, Usuario, UsuarioRequest, UsuarioUpdate } from '../models/Usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private url = `${API_URL}/usuarios`;

  constructor(private http: HttpClient) {}

  // Perfil propio
  getYo() {
    return this.http.get<Usuario>(`${this.url}/me`);
  }
  putYo(datos: UsuarioUpdate) {
    return this.http.put<Usuario>(`${this.url}/me`, datos);
  }
  deleteYo() {
    return this.http.delete<void>(`${this.url}/me`);
  }

  // ADMIN
  getUsuarios(texto = '', tipo: TipoDeUsuario | '' = '') {
    let params = new HttpParams();
    if (texto) params = params.set('texto', texto);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<Usuario[]>(this.url, { params });
  }
  getUsuarioById(id: number) {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }
  postUsuario(usuario: UsuarioRequest) {
    return this.http.post<Usuario>(this.url, usuario);
  }
  deleteUsuario(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

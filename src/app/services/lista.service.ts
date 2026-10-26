import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../config';
import { CafeResumen } from '../models/CafeResumen';
import { Lista } from '../models/Lista';

@Injectable({
  providedIn: 'root',
})
export class ListaService {
  private url = `${API_URL}/listas`;

  constructor(private http: HttpClient) {}

  getListas() {
    return this.http.get<Lista[]>(this.url);
  }

  getListaById(id: number) {
    return this.http.get<Lista>(`${this.url}/${id}`);
  }

  postLista(nombre: string) {
    return this.http.post<Lista>(this.url, { nombre });
  }

  putLista(id: number, nombre: string) {
    return this.http.put<Lista>(`${this.url}/${id}`, { nombre });
  }

  deleteLista(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  postCafeEnLista(listaId: number, cafeId: number) {
    return this.http.post<Lista>(`${this.url}/${listaId}/cafes/${cafeId}`, {});
  }

  deleteCafeDeLista(listaId: number, cafeId: number) {
    return this.http.delete<Lista>(`${this.url}/${listaId}/cafes/${cafeId}`);
  }

  getCafeAleatorioDeLista(listaId: number) {
    return this.http.get<CafeResumen>(`${this.url}/${listaId}/aleatorio`);
  }
}

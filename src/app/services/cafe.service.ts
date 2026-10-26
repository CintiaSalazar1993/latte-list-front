import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../config';
import { Cafe, CafeRequest, FiltroCafes } from '../models/Cafe';

@Injectable({
  providedIn: 'root',
})
export class CafeService {
  private url = `${API_URL}/cafes`;

  constructor(private http: HttpClient) {}

  getCafes(filtro: FiltroCafes = {}) {
    let params = new HttpParams();
    if (filtro.nombre) params = params.set('nombre', filtro.nombre);
    if (filtro.costo) params = params.set('costo', filtro.costo);
    if (filtro.orden) params = params.set('orden', filtro.orden);
    if (filtro.etiquetas && filtro.etiquetas.length > 0) params = params.set('etiquetas', filtro.etiquetas.join(','));
    return this.http.get<Cafe[]>(this.url, { params });
  }

  getMisCafes() {
    return this.http.get<Cafe[]>(`${this.url}/mis-cafes`);
  }

  getCafeAleatorio() {
    return this.http.get<Cafe>(`${this.url}/aleatorio`);
  }

  getCafeById(id: number) {
    return this.http.get<Cafe>(`${this.url}/${id}`);
  }

  postCafe(cafe: CafeRequest) {
    return this.http.post<Cafe>(this.url, cafe);
  }

  putCafe(id: number, cafe: CafeRequest) {
    return this.http.put<Cafe>(`${this.url}/${id}`, cafe);
  }

  deleteCafe(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

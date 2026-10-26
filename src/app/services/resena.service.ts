import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../config';
import { FiltroResenas, Resena, ResenaDetalle, ResenaRequest } from '../models/Resena';

@Injectable({
  providedIn: 'root',
})
export class ResenaService {
  constructor(private http: HttpClient) {}

  getResenasDeCafe(cafeId: number) {
    return this.http.get<Resena[]>(`${API_URL}/cafes/${cafeId}/resenas`);
  }

  getMisResenas() {
    return this.http.get<Resena[]>(`${API_URL}/resenas/mis-resenas`);
  }

  postResena(cafeId: number, resena: ResenaRequest) {
    return this.http.post<Resena>(`${API_URL}/cafes/${cafeId}/resenas`, resena);
  }

  deleteResena(id: number) {
    return this.http.delete<void>(`${API_URL}/resenas/${id}`);
  }

  getResenaById(id: number) {
    return this.http.get<ResenaDetalle>(`${API_URL}/resenas/${id}`);
  }

  putResena(id: number, resena: ResenaRequest) {
    return this.http.put<ResenaDetalle>(`${API_URL}/resenas/${id}`, resena);
  }

  getResenasRecibidas() {
    return this.http.get<Resena[]>(`${API_URL}/resenas/recibidas`);
  }

  getTodasLasResenas(filtro: FiltroResenas = {}) {
    let params = new HttpParams();
    if (filtro.cafeId) params = params.set('cafeId', filtro.cafeId);
    if (filtro.puntajeMin) params = params.set('puntajeMin', filtro.puntajeMin);
    if (filtro.puntajeMax) params = params.set('puntajeMax', filtro.puntajeMax);
    return this.http.get<Resena[]>(`${API_URL}/resenas`, { params });
  }
}

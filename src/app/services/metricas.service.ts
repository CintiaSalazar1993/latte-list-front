import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../config';
import { MetricasDuenio, MetricasGlobales } from '../models/Metricas';

@Injectable({ providedIn: 'root' })
export class MetricasService {
  constructor(private http: HttpClient) {}

  /** RF25 (DUENIO) */
  getMisMetricas() {
    return this.http.get<MetricasDuenio>(`${API_URL}/cafes/mis-cafes/metricas`);
  }

  /** RF28 (ADMIN) */
  getMetricasGlobales() {
    return this.http.get<MetricasGlobales>(`${API_URL}/metricas`);
  }
}

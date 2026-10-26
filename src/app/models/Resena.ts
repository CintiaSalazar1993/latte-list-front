export interface Resena {
  id: number;
  cafeId: number;
  cafeNombre: string;
  autor: string;
  puntuacionGeneral: number;
  comentario: string;
  fecha: string;
}

export interface ResenaRequest {
  puntuacionGeneral: number;
  puntuacionPrecio: number;
  puntuacionAtencion: number;
  comentario: string;
}

/** Detalle completo (GET /resenas/{id}): incluye los tres puntajes. */
export interface ResenaDetalle extends Resena {
  usuarioId: number;
  puntuacionPrecio: number;
  puntuacionAtencion: number;
}

export interface FiltroResenas {
  cafeId?: number | null;
  puntajeMin?: number | null;
  puntajeMax?: number | null;
}

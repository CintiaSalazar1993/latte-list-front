export type CostoPromedio = '$' | '$$' | '$$$';
export const COSTOS: CostoPromedio[] = ['$', '$$', '$$$'];

export const ETIQUETAS = [
  'CAFE_ESPECIALIDAD', 'CAFE_COMERCIAL', 'TOSTADO_PROPIO', 'ORGANICO', 'BLEND_EXCLUSIVO',
  'PASTELERIA_FRANCESA', 'PASTELERIA_ITALIANA', 'VEGANO', 'VEGETARIANO', 'SIN_TACC',
  'APTO_CELIACOS', 'BRUNCH', 'TEMATICO', 'MINIMALISTA', 'VINTAGE', 'PET_FRIENDLY', 'LIBROS',
  'ARTE', 'MUSICA_EN_VIVO', 'ESTILO_COWORKING', 'FRENTE_AL_MAR', 'ZONA_CENTRICA', 'WIFI',
  'ENCHUFES_DISPONIBLES', 'TERRAZA', 'PATIO', 'CALEFACCION', 'AIRE_ACONDICIONADO',
  'ESTUDIANTES', 'GRUPOS_GRANDES', 'FAMILIAR', 'PAREJAS',
] as const;
export type Etiqueta = (typeof ETIQUETAS)[number];

export interface Cafe {
  id: number;
  nombre: string;
  direccion: string;
  costoPromedio: CostoPromedio;
  logo: string | null;
  instagramUrl: string | null;
  etiquetas: Etiqueta[];
  duenioId: number;
  duenioNombre: string;
  puntuacionPromedio: number | null;
  cantidadResenas: number;
}

/** Datos que se envían al crear o editar un café. */
export interface CafeRequest {
  nombre: string;
  direccion: string;
  costoPromedio: CostoPromedio;
  logo: string | null;
  instagramUrl: string | null;
  etiquetas: Etiqueta[];
  idDuenio?: number | null;
}

export type OrdenCafes = 'nombre' | 'puntuacion' | 'costo';

export interface FiltroCafes {
  orden?: OrdenCafes;
  nombre?: string;
  costo?: CostoPromedio | '';
  etiquetas?: Etiqueta[];
}

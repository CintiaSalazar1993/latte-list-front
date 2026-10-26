import { CostoPromedio, Etiqueta } from '../models/Cafe';

/** Texto legible de cada etiqueta del enum del backend. */
export const ETIQUETA_LABEL: Record<Etiqueta, string> = {
  CAFE_ESPECIALIDAD: 'Café de especialidad',
  CAFE_COMERCIAL: 'Café comercial',
  TOSTADO_PROPIO: 'Tostado propio',
  ORGANICO: 'Orgánico',
  BLEND_EXCLUSIVO: 'Blend exclusivo',
  PASTELERIA_FRANCESA: 'Pastelería francesa',
  PASTELERIA_ITALIANA: 'Pastelería italiana',
  VEGANO: 'Vegano',
  VEGETARIANO: 'Vegetariano',
  SIN_TACC: 'Sin TACC',
  APTO_CELIACOS: 'Apto celíacos',
  BRUNCH: 'Brunch',
  TEMATICO: 'Temático',
  MINIMALISTA: 'Minimalista',
  VINTAGE: 'Vintage',
  PET_FRIENDLY: 'Pet friendly',
  LIBROS: 'Libros',
  ARTE: 'Arte',
  MUSICA_EN_VIVO: 'Música en vivo',
  ESTILO_COWORKING: 'Para trabajar',
  FRENTE_AL_MAR: 'Frente al mar',
  ZONA_CENTRICA: 'Zona céntrica',
  WIFI: 'Wi-Fi',
  ENCHUFES_DISPONIBLES: 'Enchufes',
  TERRAZA: 'Terraza',
  PATIO: 'Patio',
  CALEFACCION: 'Calefacción',
  AIRE_ACONDICIONADO: 'Aire acondicionado',
  ESTUDIANTES: 'Estudiantes',
  GRUPOS_GRANDES: 'Grupos grandes',
  FAMILIAR: 'Familiar',
  PAREJAS: 'Parejas',
};

/** Etiquetas agrupadas para mostrarlas ordenadas en filtros y formularios. */
export const GRUPOS_ETIQUETAS: { nombre: string; etiquetas: Etiqueta[] }[] = [
  { nombre: 'El café', etiquetas: ['CAFE_ESPECIALIDAD', 'CAFE_COMERCIAL', 'TOSTADO_PROPIO', 'ORGANICO', 'BLEND_EXCLUSIVO'] },
  { nombre: 'Para comer', etiquetas: ['PASTELERIA_FRANCESA', 'PASTELERIA_ITALIANA', 'BRUNCH', 'VEGANO', 'VEGETARIANO', 'SIN_TACC', 'APTO_CELIACOS'] },
  { nombre: 'Ambiente', etiquetas: ['TEMATICO', 'MINIMALISTA', 'VINTAGE', 'LIBROS', 'ARTE', 'MUSICA_EN_VIVO', 'PET_FRIENDLY'] },
  { nombre: 'Lugar', etiquetas: ['FRENTE_AL_MAR', 'ZONA_CENTRICA', 'TERRAZA', 'PATIO', 'CALEFACCION', 'AIRE_ACONDICIONADO'] },
  { nombre: 'Para trabajar', etiquetas: ['ESTILO_COWORKING', 'WIFI', 'ENCHUFES_DISPONIBLES'] },
  { nombre: 'Ideal para', etiquetas: ['ESTUDIANTES', 'GRUPOS_GRANDES', 'FAMILIAR', 'PAREJAS'] },
];

export const TODAS_LAS_ETIQUETAS: Etiqueta[] = GRUPOS_ETIQUETAS.flatMap((g) => g.etiquetas);

export const COSTOS_CON_NOMBRE: { valor: CostoPromedio; label: string }[] = [
  { valor: '$', label: 'Económico' },
  { valor: '$$', label: 'Intermedio' },
  { valor: '$$$', label: 'Alto' },
];

export const COSTO_LABEL: Record<CostoPromedio, string> = { $: 'Económico', $$: 'Intermedio', $$$: 'Alto' };

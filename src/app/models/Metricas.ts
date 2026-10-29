export interface CafeMetrica {
  cafeId: number;
  nombre: string;
  cantidadResenas: number;
  puntuacionPromedio: number | null;
  posicion: number | null;
}

/** RF25 */
export interface MetricasDuenio {
  totalCafes: number;
  totalResenas: number;
  promedioGeneral: number | null;
  totalRankeados: number;
  cafes: CafeMetrica[];
}

export interface TopCafe {
  cafeId: number;
  nombre: string;
  puntuacionPromedio: number;
  cantidadResenas: number;
}

export interface AltaMes {
  mes: string; // "2026-10"
  clientes: number;
  duenios: number;
}

/** RF28 */
export interface MetricasGlobales {
  totalUsuarios: number;
  clientes: number;
  duenios: number;
  admins: number;
  totalCafes: number;
  totalResenas: number;
  promedioGeneral: number | null;
  cafesPorCosto: Record<string, number>;
  cafesPorEtiqueta: Record<string, number>;
  topCafes: TopCafe[];
  altasUltimosMeses: AltaMes[];
}
import { CostoPromedio } from './Cafe';

/** Versión corta de un café, la que viene dentro de las listas. */
export interface CafeResumen {
  id: number;
  nombre: string;
  direccion: string;
  costoPromedio: CostoPromedio;
  logo: string | null;
}

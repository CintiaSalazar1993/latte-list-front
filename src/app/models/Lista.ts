import { CafeResumen } from './CafeResumen';

export interface Lista {
  id: number;
  nombre: string;
  fechaCreacion: string;
  favoritos: boolean;
  cantidadCafes: number;
  cafes: CafeResumen[];
}

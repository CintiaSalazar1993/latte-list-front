import { Pipe, PipeTransform } from '@angular/core';
import { CostoPromedio, Etiqueta } from '../models/Cafe';
import { ROLES_LABEL, TipoDeUsuario } from '../models/Usuario';
import { COSTO_LABEL, ETIQUETA_LABEL } from '../utils/etiquetas';

/** CAFE_ESPECIALIDAD -> "Café de especialidad" */
@Pipe({ name: 'etiqueta' })
export class EtiquetaPipe implements PipeTransform {
  transform(valor: Etiqueta): string {
    return ETIQUETA_LABEL[valor] ?? valor;
  }
}

/** "$$" -> "Intermedio" */
@Pipe({ name: 'costo' })
export class CostoPipe implements PipeTransform {
  transform(valor: CostoPromedio): string {
    return COSTO_LABEL[valor] ?? valor;
  }
}

/** DUENIO -> "Dueño" */
@Pipe({ name: 'rol' })
export class RolPipe implements PipeTransform {
  transform(valor: TipoDeUsuario | null | undefined): string {
    return valor ? ROLES_LABEL[valor] : '';
  }
}

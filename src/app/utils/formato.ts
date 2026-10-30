/** Convierte una fecha del back "2026-10-26" en "26/10/2026". */
export function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

/** Convierte 4.5 en "4,5". Si no hay número muestra un guion. */
export function formatearNumero(numero: number | null | undefined, decimales = 1): string {
  if (numero === null || numero === undefined) return '–';
  return numero.toFixed(decimales).replace('.', ',');
}
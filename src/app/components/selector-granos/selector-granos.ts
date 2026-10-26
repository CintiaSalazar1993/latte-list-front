import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Selector de puntuación (1 a 5) con granos. Implementa ControlValueAccessor
 * para poder usarse con formControlName dentro de un formulario reactivo.
 */
@Component({
  selector: 'app-selector-granos',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectorGranos), multi: true }],
  templateUrl: './selector-granos.html',
  styleUrl: './selector-granos.css',
})
export class SelectorGranos implements ControlValueAccessor {
  etiqueta = input('Puntuación');

  grano =
    'M12 2.2c4.6 0 8 4.3 8 9.8s-3.4 9.8-8 9.8-8-4.3-8-9.8 3.4-9.8 8-9.8zm.9 2.1c-1.7 2-2.2 4.2-1.3 6.6.9 2.5.6 4.9-1.1 7.4-.3.4-.2.8.2 1 .3.2.7.1 1-.3 1.9-2.8 2.3-5.6 1.2-8.5-.7-2-.4-3.8 1-5.4.3-.3.2-.8-.1-1-.3-.2-.7-.1-.9.2z';
  valor = signal(0);
  hover = signal(0);
  deshabilitado = signal(false);
  textos = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];
  numeros = [1, 2, 3, 4, 5];

  private onChange: (v: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  elegir(n: number) {
    this.valor.set(n);
    this.onChange(n);
    this.onTouched();
  }

  alTocar() {
    this.onTouched();
  }

  writeValue(v: number | null) {
    this.valor.set(v ?? 0);
  }
  registerOnChange(fn: (v: number | null) => void) {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean) {
    this.deshabilitado.set(d);
  }
}

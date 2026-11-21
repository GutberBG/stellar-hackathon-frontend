import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBob',
  standalone: true,
})
export class CurrencyBobPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showSymbol: boolean = true): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return showSymbol ? 'Bs. 0.00' : '0.00';
    }
    const num = Number(value);
    const formatted = new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

    return showSymbol ? `Bs. ${formatted}` : formatted;
  }
}

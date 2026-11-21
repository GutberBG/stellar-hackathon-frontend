import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyUsdc',
  standalone: true,
})
export class CurrencyUsdcPipe implements PipeTransform {
  transform(value: number | string | null | undefined, suffix: boolean = true): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return suffix ? '$0.00 USDC' : '$0.00';
    }
    const num = Number(value);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

    return suffix ? `${formatted} USDC` : formatted;
  }
}

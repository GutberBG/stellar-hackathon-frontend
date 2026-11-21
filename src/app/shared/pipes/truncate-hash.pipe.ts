import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateHash',
  standalone: true,
})
export class TruncateHashPipe implements PipeTransform {
  transform(hash: string | null | undefined, startChars: number = 6, endChars: number = 4): string {
    if (!hash) return '—';
    if (hash.length <= startChars + endChars + 3) return hash;
    return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
  }
}

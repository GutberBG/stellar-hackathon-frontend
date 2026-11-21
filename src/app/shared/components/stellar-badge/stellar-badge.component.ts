import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncateHashPipe } from '../../pipes/truncate-hash.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-stellar-badge',
  standalone: true,
  imports: [CommonModule, TruncateHashPipe],
  templateUrl: './stellar-badge.component.html',
  styleUrl: './stellar-badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StellarBadgeComponent {
  @Input() txHash: string = '';
  @Input() startChars: number = 6;
  @Input() endChars: number = 4;
  @Input() showLink: boolean = true;

  protected copied = signal<boolean>(false);

  get explorerUrl(): string {
    return `${environment.stellarExplorerBase}${this.txHash}`;
  }

  copyToClipboard(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.txHash) return;
    navigator.clipboard.writeText(this.txHash).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';
import { TruncateHashPipe } from '../../pipes/truncate-hash.pipe';
import { StellarBadgeComponent } from '../stellar-badge/stellar-badge.component';

@Component({
  selector: 'app-qr-receipt-card',
  standalone: true,
  imports: [CommonModule, TruncateHashPipe, StellarBadgeComponent],
  templateUrl: './qr-receipt-card.component.html',
  styleUrl: './qr-receipt-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrReceiptCardComponent implements OnChanges {
  @Input() loanCode: string = 'LOAN-AB-1-001';
  @Input() producerName: string = 'Mateo Mamani Ticona';
  @Input() amountBob: number = 10440.0;
  @Input() amountUsdc: number = 1500.0;
  @Input() qrPayload: string = '';
  @Input() trustlessEscrowId: string = 'TW-ESCROW-AB-001';
  @Input() stellarTxHash: string = '';

  protected qrDataUrl = signal<string>('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['qrPayload'] || changes['loanCode']) {
      this.generateQrCode();
    }
  }

  private async generateQrCode(): Promise<void> {
    const payload = this.qrPayload || `https://pollar.app/pay?code=${this.loanCode}&amount=${this.amountBob}`;
    try {
      const url = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 280,
        color: {
          dark: '#1D1D1F',
          light: '#FFFFFF',
        },
      });
      this.qrDataUrl.set(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }

  protected downloadQr(): void {
    const url = this.qrDataUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pollar-QR-${this.loanCode}.png`;
    a.click();
  }
}

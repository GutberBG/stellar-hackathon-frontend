import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';
import { AuthService } from '../../core/services/auth.service';
import { ProducerService } from '../../core/services/producer.service';
import { DeliveryService } from '../../core/services/delivery.service';
import { ProducerDeliveryBrief, ProducerLoanBrief } from '../../core/models/producer.model';
import { CurrencyBobPipe } from '../../shared/pipes/currency-bob.pipe';
import { CurrencyUsdcPipe } from '../../shared/pipes/currency-usdc.pipe';
import { TruncateHashPipe } from '../../shared/pipes/truncate-hash.pipe';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-mis-operaciones',
  standalone: true,
  imports: [CommonModule, CurrencyBobPipe, CurrencyUsdcPipe, TruncateHashPipe, TimeAgoPipe],
  templateUrl: './mis-operaciones.component.html',
  styleUrl: './mis-operaciones.component.css',
})
export class MisOperacionesComponent implements OnInit {
  private authService = inject(AuthService);
  private producerService = inject(ProducerService);
  private deliveryService = inject(DeliveryService);

  producerName = signal<string>('Mateo Mamani Ticona');
  producerCommunity = signal<string>('Sapecho (Alto Beni)');
  totalCacaoKg = signal<number>(3820.0);
  totalPaidBob = signal<number>(44933.76);
  activeCreditUsdc = signal<number>(1500.0);

  loans = signal<ProducerLoanBrief[]>([]);
  deliveries = signal<ProducerDeliveryBrief[]>([]);

  // QR Modal State (Single Elevated Surface)
  isQrModalOpen = signal<boolean>(false);
  selectedLoan = signal<ProducerLoanBrief | null>(null);
  qrDataUrl = signal<string>('');
  copiedHash = signal<string | null>(null);

  ngOnInit(): void {
    const current = this.authService.currentProducer();
    const producerId = current?.id || 1;

    if (current) {
      this.producerName.set(current.name);
      this.producerCommunity.set(current.community);
    }

    this.producerService.getProducerById(producerId).subscribe({
      next: (detail) => {
        this.producerName.set(detail.name);
        this.producerCommunity.set(detail.community);
        this.totalCacaoKg.set(detail.total_delivered_kg || 3820.0);
        this.deliveries.set(detail.deliveries || []);
        this.loans.set(detail.active_loans || []);

        const sumBob = (detail.deliveries || []).reduce((acc, d) => acc + d.total_amount_bob, 0);
        if (sumBob > 0) this.totalPaidBob.set(sumBob);

        const sumCredit = (detail.active_loans || [])
          .filter((l) => l.status === 'ACTIVE_ESCROW')
          .reduce((acc, l) => acc + l.approved_amount_usdc, 0);
        if (sumCredit > 0) this.activeCreditUsdc.set(sumCredit);
      },
      error: () => {
        // Fallback default mock
        this.producerService.getProducerById(1).subscribe((d) => {
          this.deliveries.set(d.deliveries);
          this.loans.set(d.active_loans);
        });
      },
    });
  }

  async openQrModal(loan: ProducerLoanBrief): Promise<void> {
    this.selectedLoan.set(loan);
    this.isQrModalOpen.set(true);

    const payload = `pollar://qr/pay?code=${loan.loan_code}&amount=${loan.approved_amount_usdc * 6.96}&cur=BOB&dest=${encodeURIComponent(this.producerName())}`;

    try {
      const url = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 260,
        color: {
          dark: '#1D1D1F',
          light: '#FFFFFF',
        },
      });
      this.qrDataUrl.set(url);
    } catch (e) {
      console.error('Error generating QR:', e);
    }
  }

  closeQrModal(): void {
    this.isQrModalOpen.set(false);
    this.selectedLoan.set(null);
    this.qrDataUrl.set('');
  }

  copyHash(hash: string): void {
    navigator.clipboard?.writeText(hash);
    this.copiedHash.set(hash);
    setTimeout(() => this.copiedHash.set(null), 2500);
  }
}

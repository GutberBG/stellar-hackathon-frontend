import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FactoringService } from '../../core/services/factoring.service';
import { StateService } from '../../core/services/state.service';
import {
  FactoringExecuteRequest,
  FactoringExecuteResponse,
  FactoringSettleResponse,
  LoanSummaryResponse,
} from '../../core/models/factoring.model';
import { QrReceiptCardComponent } from '../../shared/components/qr-receipt-card/qr-receipt-card.component';
import { CurrencyBobPipe } from '../../shared/pipes/currency-bob.pipe';
import { CurrencyUsdcPipe } from '../../shared/pipes/currency-usdc.pipe';
import { environment } from '../../../environments/environment';

type ExecutionStep = 'IDLE' | 'STEP_1_VAQUITA' | 'STEP_2_TRUSTLESS' | 'STEP_3_POLLAR' | 'COMPLETED';

@Component({
  selector: 'app-settlement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QrReceiptCardComponent,
    CurrencyBobPipe,
    CurrencyUsdcPipe,
  ],
  templateUrl: './settlement.component.html',
  styleUrl: './settlement.component.css',
})
export class SettlementComponent implements OnInit {
  private factoringService = inject(FactoringService);
  private state = inject(StateService);

  readonly exchangeRate = environment.exchangeRateBob;

  protected currentProducer = this.state.selectedProducer;
  protected requestedAmountUsdc: number = 1500;
  protected maxApprovedUsdc = computed(() => {
    const sim = this.state.pendingSimulation();
    return sim ? sim.max_advance_usdc : 2640;
  });

  protected isExecuting = signal<boolean>(false);
  protected executionStep = signal<ExecutionStep>('IDLE');
  protected executionResult = signal<FactoringExecuteResponse | null>(null);

  protected activeLoans = signal<LoanSummaryResponse[]>([]);
  protected isSettling = signal<boolean>(false);
  protected settlingLoanId = signal<number | null>(null);
  protected settlementResult = signal<FactoringSettleResponse | null>(null);

  ngOnInit(): void {
    const sim = this.state.pendingSimulation();
    if (sim) {
      this.requestedAmountUsdc = sim.max_advance_usdc;
    }

    this.factoringService.getActiveLoans().subscribe((loans) => {
      this.activeLoans.set(loans);
    });
  }

  stepState(stepNumber: number): 'idle' | 'active' | 'done' {
    const current = this.executionStep();
    if (stepNumber === 1) {
      if (current === 'STEP_1_VAQUITA') return 'active';
      if (['STEP_2_TRUSTLESS', 'STEP_3_POLLAR', 'COMPLETED'].includes(current)) return 'done';
      return 'idle';
    }
    if (stepNumber === 2) {
      if (current === 'STEP_2_TRUSTLESS') return 'active';
      if (['STEP_3_POLLAR', 'COMPLETED'].includes(current)) return 'done';
      return 'idle';
    }
    if (stepNumber === 3) {
      if (current === 'STEP_3_POLLAR') return 'active';
      if (current === 'COMPLETED') return 'done';
      return 'idle';
    }
    return 'idle';
  }

  executeAdvance(): void {
    this.isExecuting.set(true);
    this.executionStep.set('STEP_1_VAQUITA');

    const req: FactoringExecuteRequest = {
      producer_id: this.currentProducer().id,
      requested_amount_usdc: Number(this.requestedAmountUsdc),
      expected_harvest_kg: 1000,
      rainfall_mm: 160,
      humidity_pct: 78,
    };

    setTimeout(() => {
      this.executionStep.set('STEP_2_TRUSTLESS');

      setTimeout(() => {
        this.executionStep.set('STEP_3_POLLAR');

        this.factoringService.execute(req).subscribe({
          next: (resp) => {
            setTimeout(() => {
              this.executionStep.set('COMPLETED');
              this.executionResult.set(resp);
              this.isExecuting.set(false);

              this.factoringService.getActiveLoans().subscribe((loans) => {
                this.activeLoans.set(loans);
              });
            }, 500);
          },
          error: (err) => {
            console.error('Error executing factoring:', err);
            this.isExecuting.set(false);
            this.executionStep.set('IDLE');
          },
        });
      }, 500);
    }, 500);
  }

  settleLoan(loanId: number): void {
    this.isSettling.set(true);
    this.settlingLoanId.set(loanId);

    this.factoringService.settle(loanId).subscribe({
      next: (resp) => {
        this.settlementResult.set(resp);
        this.isSettling.set(false);
        this.settlingLoanId.set(null);

        this.activeLoans.update((list) =>
          list.map((l) => (l.id === loanId ? { ...l, status: 'SETTLED' } : l))
        );
      },
      error: (err) => {
        console.error('Error settling loan:', err);
        this.isSettling.set(false);
        this.settlingLoanId.set(null);
      },
    });
  }
}

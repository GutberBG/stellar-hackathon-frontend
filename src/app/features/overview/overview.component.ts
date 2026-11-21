import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { StateService } from '../../core/services/state.service';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { AnimatedCounterComponent } from '../../shared/components/animated-counter/animated-counter.component';
import { StellarBadgeComponent } from '../../shared/components/stellar-badge/stellar-badge.component';
import { CurrencyBobPipe } from '../../shared/pipes/currency-bob.pipe';
import { CurrencyUsdcPipe } from '../../shared/pipes/currency-usdc.pipe';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AnimatedCounterComponent,
    StellarBadgeComponent,
    CurrencyBobPipe,
    CurrencyUsdcPipe,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class OverviewComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private state = inject(StateService);

  protected dashboardData = signal<DashboardResponse | null>(null);

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe((data) => {
      this.dashboardData.set(data);
      if (data.vaquita_pool) {
        this.state.updateLiquidity(
          data.vaquita_pool.available_liquidity_usdc,
          data.vaquita_pool.total_liquidity_usdc
        );
      }
    });
  }
}

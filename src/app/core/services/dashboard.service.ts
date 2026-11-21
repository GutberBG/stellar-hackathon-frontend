import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardResponse } from '../models/dashboard.model';
import { INITIAL_DELIVERIES, INITIAL_LOANS } from './mock-data';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private api = inject(ApiService);

  getDashboard(): Observable<DashboardResponse> {
    return this.api.get<DashboardResponse>('/dashboard', () => {
      return {
        vaquita_pool: {
          pool_id: 'VAQUITA-POOL-ALTO-BENI-01',
          total_liquidity_usdc: 30000.0,
          reserved_liquidity_usdc: 5000.0,
          available_liquidity_usdc: 25000.0,
        },
        total_advanced_usdc: 18450.0,
        total_advanced_bob: 128412.0,
        active_loans_count: INITIAL_LOANS.filter((l) => l.status === 'ACTIVE_ESCROW').length,
        settled_loans_count: 8,
        total_deliveries_count: 42,
        recent_deliveries: INITIAL_DELIVERIES,
        active_loans: INITIAL_LOANS,
      };
    });
  }
}

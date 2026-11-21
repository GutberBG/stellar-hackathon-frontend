import { DeliveryResponse } from './delivery.model';
import { LoanSummaryResponse } from './factoring.model';

export interface PoolStatusResponse {
  pool_id: string;
  total_liquidity_usdc: number;
  reserved_liquidity_usdc: number;
  available_liquidity_usdc: number;
}

export interface DashboardResponse {
  vaquita_pool: PoolStatusResponse;
  total_advanced_usdc: number;
  total_advanced_bob: number;
  active_loans_count: number;
  settled_loans_count: number;
  total_deliveries_count: number;
  recent_deliveries: DeliveryResponse[];
  active_loans: LoanSummaryResponse[];
}

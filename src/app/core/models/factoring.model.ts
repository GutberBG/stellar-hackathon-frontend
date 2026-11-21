import { RiskLevel } from './producer.model';

export type LoanStatus = 'PENDING' | 'ACTIVE_ESCROW' | 'SETTLED' | 'REJECTED';

export interface FactoringSimulateRequest {
  producer_id: number;
  expected_harvest_kg: number;
  rainfall_mm: number;
  humidity_pct: number;
}

export interface FactoringSimulateResponse {
  producer_id: number;
  producer_name: string;
  community: string;
  cooperative: string;
  expected_harvest_kg: number;
  risk_score: number;
  risk_level: RiskLevel;
  approved_advance_pct: number;
  estimated_harvest_value_usdc: number;
  max_advance_usdc: number;
  max_advance_bob: number;
  risk_factors: string[];
}

export interface FactoringExecuteRequest {
  producer_id: number;
  requested_amount_usdc: number;
  expected_harvest_kg: number;
  rainfall_mm: number;
  humidity_pct: number;
}

export interface FactoringExecuteResponse {
  loan_id: number;
  loan_code: string;
  producer_id: number;
  producer_name: string;
  requested_amount_usdc: number;
  approved_amount_usdc: number;
  amount_bob: number;
  risk_score: number;
  risk_level: RiskLevel;
  status: LoanStatus;
  vaquita_reservation_id: string;
  trustless_escrow_id: string;
  pollar_payout_id: string;
  pollar_qr_payload: string;
  qr_deep_link: string;
  created_at: string;
}

export interface FactoringSettleResponse {
  loan_id: number;
  loan_code: string;
  status: LoanStatus;
  principal_usdc: number;
  fee_vaquita_usdc: number;
  fee_ayni_usdc: number;
  total_settled_usdc: number;
  trustless_settlement_tx: string;
  settled_at: string;
  message: string;
}

export interface LoanSummaryResponse {
  id: number;
  loan_code: string;
  producer_id: number;
  producer_name?: string;
  requested_amount_usdc: number;
  approved_amount_usdc: number;
  amount_bob: number;
  risk_level: RiskLevel;
  status: LoanStatus;
  trustless_escrow_id: string;
  created_at: string;
}

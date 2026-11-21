export type RiskLevel = 'BAJO' | 'MEDIO' | 'ALTO';

export interface Producer {
  id: number;
  name: string;
  community: string;
  cooperative: string;
  eudr_latitude: number;
  eudr_longitude: number;
  eudr_plot_code: string;
  phone: string;
  compliance_score: number;
  risk_tier: RiskLevel;
  created_at?: string;
}

export interface ProducerDeliveryBrief {
  id: number;
  delivery_code: string;
  cacao_type: 'BABA' | 'SECO';
  net_dry_weight_kg: number;
  quality_grade: 'A' | 'B' | 'C';
  total_amount_usdc: number;
  total_amount_bob: number;
  stellar_tx_hash?: string;
  created_at: string;
}

export interface ProducerLoanBrief {
  id: number;
  loan_code: string;
  requested_amount_usdc: number;
  approved_amount_usdc: number;
  status: 'PENDING' | 'ACTIVE_ESCROW' | 'SETTLED' | 'REJECTED';
  created_at: string;
}

export interface ProducerDetail extends Producer {
  deliveries_count: number;
  total_delivered_kg: number;
  deliveries: ProducerDeliveryBrief[];
  active_loans: ProducerLoanBrief[];
}

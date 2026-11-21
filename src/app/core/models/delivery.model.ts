export type CacaoType = 'BABA' | 'SECO';
export type QualityGrade = 'A' | 'B' | 'C';
export type DeliveryStatus = 'PENDING' | 'NOTARIZED';

export interface DeliveryCreateRequest {
  producer_id: number;
  cacao_type: CacaoType;
  gross_weight_kg: number;
  moisture_percentage: number;
  quality_grade: QualityGrade;
  base_price_per_kg_usdc: number;
}

export interface DeliveryResponse {
  id: number;
  delivery_code: string;
  producer_id: number;
  producer_name?: string;
  cacao_type: CacaoType;
  gross_weight_kg: number;
  moisture_percentage: number;
  net_dry_weight_kg: number;
  quality_grade: QualityGrade;
  base_price_per_kg_usdc: number;
  final_price_per_kg_usdc: number;
  total_amount_usdc: number;
  total_amount_bob: number;
  eudr_coords: string;
  payload_hash: string;
  stellar_tx_hash?: string;
  status: DeliveryStatus;
  created_at: string;
}

export interface DeliveryListResponse {
  total: number;
  items: DeliveryResponse[];
}

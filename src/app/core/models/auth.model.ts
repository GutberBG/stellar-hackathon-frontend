import { Producer } from './producer.model';

export type UserRole = 'PRODUCTOR' | 'ACOPIADOR' | 'LIQUIDEZ';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  pollar_wallet_address?: string;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  producer?: Producer;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  ci_number?: string;
  community?: string;
  cooperative?: string;
  phone?: string;
  parcel_hectares?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PollarOAuthRequest {
  email: string;
  full_name: string;
  role?: UserRole;
}

export interface ProducerUpdateRequest {
  name?: string;
  ci_number?: string;
  community?: string;
  cooperative?: string;
  phone?: string;
  bank_account_hint?: string;
  eudr_latitude?: number;
  eudr_longitude?: number;
  parcel_hectares?: number;
  eudr_certified?: boolean;
}

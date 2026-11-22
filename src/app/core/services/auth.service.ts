import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ProducerService } from './producer.service';
import {
  User,
  UserRole,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  PollarOAuthRequest,
  ProducerUpdateRequest,
} from '../models/auth.model';
import { Producer } from '../models/producer.model';
import { INITIAL_PRODUCERS } from './mock-data';

const DEMO_USERS: Record<UserRole, { user: User; producer?: Producer }> = {
  ACOPIADOR: {
    user: {
      id: 1,
      email: 'acopiador@aynicacao.bo',
      full_name: 'Técnico Cooperativa El Ceibo',
      role: 'ACOPIADOR',
      pollar_wallet_address: 'GBCEIBO77XYZACCOPIOSTELLARALTOBENI99999999',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  PRODUCTOR: {
    user: {
      id: 2,
      email: 'mateo@aynicacao.bo',
      full_name: 'Mateo Mamani Ticona',
      role: 'PRODUCTOR',
      pollar_wallet_address: 'GDPOLLAR377MATEOMAMANIALTOBENISTELLAR7777',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    producer: INITIAL_PRODUCERS[0],
  },
  LIQUIDEZ: {
    user: {
      id: 3,
      email: 'inversor@aynicacao.bo',
      full_name: 'Inversor Vaquita Pool',
      role: 'LIQUIDEZ',
      pollar_wallet_address: 'GCVAQUITA99POOLUSDCSTELLARINVESTOR11111111',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private producerService = inject(ProducerService);

  // Load from localStorage or default to ACOPIADOR for presentation readiness
  private storedUser = this.getStoredJson<User>('ayni_user');
  private storedProducer = this.getStoredJson<Producer>('ayni_producer');

  public readonly currentUser = signal<User | null>(
    this.storedUser || DEMO_USERS.ACOPIADOR.user
  );
  public readonly currentProducer = signal<Producer | null>(
    this.storedProducer || (this.storedUser?.role === 'PRODUCTOR' ? DEMO_USERS.PRODUCTOR.producer! : DEMO_USERS.PRODUCTOR.producer!)
  );
  public readonly token = signal<string | null>(
    localStorage.getItem('ayni_token') || 'ayni_demo_token_presenter_mode'
  );

  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly activeRole = computed<UserRole>(() => this.currentUser()?.role ?? 'ACOPIADOR');

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', req, () => {
      // Offline fallback: match demo user
      const matchedRole: UserRole = req.email.includes('mateo')
        ? 'PRODUCTOR'
        : req.email.includes('inversor')
        ? 'LIQUIDEZ'
        : 'ACOPIADOR';

      const demo = DEMO_USERS[matchedRole];
      return {
        access_token: `ayni_token_${demo.user.id}_demo`,
        token_type: 'bearer',
        user: demo.user,
        producer: demo.producer,
      };
    }).pipe(
      tap((res) => this.setSession(res))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', req, (body) => {
      const newUser: User = {
        id: Math.floor(100 + Math.random() * 900),
        email: body.email,
        full_name: body.full_name,
        role: body.role,
        pollar_wallet_address: `GDPOLLAR${Math.floor(10000000 + Math.random() * 90000000)}STELLAR`,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      let newProducer: Producer | undefined = undefined;
      if (body.role === 'PRODUCTOR') {
        newProducer = {
          id: Math.floor(10 + Math.random() * 90),
          user_id: newUser.id,
          name: body.full_name,
          ci_number: body.ci_number || '1234567-LP',
          community: body.community || 'Sapecho (Alto Beni)',
          cooperative: body.cooperative || 'Central de Cooperativas El Ceibo',
          eudr_latitude: -15.5412,
          eudr_longitude: -67.3298,
          eudr_plot_code: `BO-LPZ-AB-${body.community?.slice(0, 4).toUpperCase() || 'ALTO'}-${Math.floor(1000 + Math.random() * 9000)}`,
          parcel_hectares: body.parcel_hectares || 3.5,
          eudr_certified: true,
          phone: body.phone || '+59171234567',
          bank_account_hint: 'Banco Unión - QR Simple',
          compliance_score: 0.95,
          risk_tier: 'BAJO',
          created_at: new Date().toISOString(),
        };
      }

      return {
        access_token: `ayni_token_${newUser.id}_registered`,
        token_type: 'bearer',
        user: newUser,
        producer: newProducer,
      };
    }).pipe(
      tap((res) => this.setSession(res))
    );
  }

  pollarOAuth(req: PollarOAuthRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/pollar-oauth', req, (body) => {
      const role: UserRole = body.role || 'PRODUCTOR';
      const newUser: User = {
        id: 777,
        email: body.email,
        full_name: body.full_name,
        role: role,
        pollar_wallet_address: 'GDPOLLAR9977INVISIBLEXACCOUNTALTOBENI0001',
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const producer: Producer = {
        id: 1,
        user_id: 777,
        name: body.full_name,
        ci_number: '6543210-LP',
        community: 'Sapecho (Alto Beni)',
        cooperative: 'Central de Cooperativas El Ceibo',
        eudr_latitude: -15.5412,
        eudr_longitude: -67.3298,
        eudr_plot_code: 'BO-LPZ-AB-ELCEIBO-001',
        parcel_hectares: 4.5,
        eudr_certified: true,
        phone: '+59171234567',
        bank_account_hint: '1000002938491 (Banco Unión - QR Simple)',
        compliance_score: 0.96,
        risk_tier: 'BAJO',
      };

      return {
        access_token: 'ayni_pollar_oauth_token_777',
        token_type: 'bearer',
        user: newUser,
        producer: role === 'PRODUCTOR' ? producer : undefined,
      };
    }).pipe(
      tap((res) => this.setSession(res))
    );
  }

  switchRoleDemo(role: UserRole): void {
    const demo = DEMO_USERS[role];
    this.currentUser.set(demo.user);
    if (demo.producer) {
      this.currentProducer.set(demo.producer);
      localStorage.setItem('ayni_producer', JSON.stringify(demo.producer));
    }
    localStorage.setItem('ayni_user', JSON.stringify(demo.user));
    localStorage.setItem('ayni_role', role);
  }

  updateProducerLocally(updated: Producer): void {
    this.currentProducer.set(updated);
    localStorage.setItem('ayni_producer', JSON.stringify(updated));
  }

  logout(): void {
    this.currentUser.set(null);
    this.currentProducer.set(null);
    this.token.set(null);
    localStorage.removeItem('ayni_token');
    localStorage.removeItem('ayni_user');
    localStorage.removeItem('ayni_producer');
  }

  private setSession(res: AuthResponse): void {
    this.token.set(res.access_token);
    this.currentUser.set(res.user);
    if (res.producer) {
      this.currentProducer.set(res.producer);
      localStorage.setItem('ayni_producer', JSON.stringify(res.producer));
    }
    localStorage.setItem('ayni_token', res.access_token);
    localStorage.setItem('ayni_user', JSON.stringify(res.user));
    localStorage.setItem('ayni_role', res.user.role);
  }

  private getStoredJson<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}

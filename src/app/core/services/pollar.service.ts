import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { PollarClient, type AuthState, type WalletProvisioning } from '@pollar/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PollarService implements OnDestroy {
  private client: PollarClient | null = null;
  private unsubAuth?: () => void;
  private unsubWallet?: () => void;

  public readonly authState = signal<AuthState>({ step: 'idle' });
  public readonly walletProvisioning = signal<WalletProvisioning>('NONE');
  public readonly stellarAddress = signal<string | null>(null);
  public readonly userEmail = signal<string | null>(null);
  public readonly errorMessage = signal<string | null>(null);

  public readonly authStep = computed(() => this.authState().step);
  public readonly isAuthenticated = computed(() => this.authState().step === 'authenticated');

  constructor() {
    if (typeof window === 'undefined' || !environment.pollarApiKey) {
      return;
    }

    try {
      this.client = new PollarClient({
        apiKey: environment.pollarApiKey,
        stellarNetwork: 'testnet',
      });

      this.unsubAuth = this.client.onAuthStateChange((state) => {
        this.authState.set(state);
        if (state.step === 'authenticated') {
          this.errorMessage.set(null);
          this.userEmail.set(this.client?.getUserProfile()?.mail ?? null);
          void this.ensureWallet();
        } else if (state.step === 'error') {
          this.errorMessage.set(state.message);
        } else if (state.step === 'idle') {
          this.stellarAddress.set(null);
          this.userEmail.set(null);
        }
      });

      this.unsubWallet = this.client.onWalletStateChange((prov) => {
        this.walletProvisioning.set(prov);
        if (prov === 'READY') {
          const w = this.client?.getWallet();
          if (w?.address) {
            this.stellarAddress.set(w.address);
          }
        }
      });
    } catch (err) {
      console.warn('[PollarService] Init warning:', err);
    }
  }

  private async ensureWallet(): Promise<void> {
    if (!this.client) return;
    try {
      const existing = this.client.getWallet();
      if (existing?.address) {
        this.stellarAddress.set(existing.address);
        return;
      }

      if (!this.client.hasWallet()) {
        const created = await this.client.createWallet();
        if (created?.address) {
          this.stellarAddress.set(created.address);
          return;
        }
      }

      await this.client.refreshWalletState();
      const refreshed = this.client.getWallet();
      if (refreshed?.address) {
        this.stellarAddress.set(refreshed.address);
      }
    } catch (err) {
      console.error('[PollarService] ensureWallet error:', err);
      const errAny = err as { body?: { message?: string; code?: string }; message?: string };
      const detail = errAny?.body?.message || errAny?.body?.code || errAny?.message || 'No se pudo crear la wallet en Pollar';
      this.errorMessage.set(detail);
    }
  }

  loginWithGoogle(): void {
    this.errorMessage.set(null);
    this.client?.login({ provider: 'google' });
  }

  loginWithEmail(email: string): void {
    this.errorMessage.set(null);
    this.client?.login({ provider: 'email', email });
  }

  verifyEmailCode(code: string): void {
    this.errorMessage.set(null);
    this.client?.verifyEmailCode(code);
  }

  logout(): void {
    const clientAny = this.client as unknown as { logout?: () => void };
    clientAny?.logout?.();
    this.stellarAddress.set(null);
    this.userEmail.set(null);
  }

  ngOnDestroy(): void {
    this.unsubAuth?.();
    this.unsubWallet?.();
    this.client?.destroy();
  }
}

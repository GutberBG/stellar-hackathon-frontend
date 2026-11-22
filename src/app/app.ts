import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StateService } from './core/services/state.service';
import { ApiService } from './core/services/api.service';
import { AuthService } from './core/services/auth.service';
import { UserRole } from './core/models/auth.model';
import { AnimatedCounterComponent } from './shared/components/animated-counter/animated-counter.component';

interface NavItem {
  path: string;
  label: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AnimatedCounterComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected state = inject(StateService);
  protected api = inject(ApiService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  showDemoMenu = signal<boolean>(false);

  readonly activeRole = computed<UserRole>(() => this.authService.activeRole());
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.activeRole();
    if (role === 'PRODUCTOR') {
      return [
        { path: '/mi-parcela', label: 'Mi Parcela (EUDR)' },
        { path: '/factoring', label: 'Simulador IA' },
        { path: '/mis-operaciones', label: 'Mis Operaciones' },
      ];
    } else if (role === 'LIQUIDEZ') {
      return [
        { path: '/overview', label: 'Pool Vaquita' },
        { path: '/settlement', label: 'Escrows Activos' },
      ];
    } else {
      // ACOPIADOR
      return [
        { path: '/acopio', label: 'Registrar Acopio' },
        { path: '/settlement', label: 'Lotes y Liquidación' },
        { path: '/mi-parcela', label: 'Perfil Productor' },
      ];
    }
  });

  toggleDemoMenu(): void {
    this.showDemoMenu.set(!this.showDemoMenu());
  }

  switchRole(role: UserRole): void {
    this.authService.switchRoleDemo(role);
    this.showDemoMenu.set(false);

    if (role === 'PRODUCTOR') {
      this.router.navigate(['/mi-parcela']);
    } else if (role === 'LIQUIDEZ') {
      this.router.navigate(['/overview']);
    } else {
      this.router.navigate(['/acopio']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.showDemoMenu.set(false);
    this.router.navigate(['/auth']);
  }
}

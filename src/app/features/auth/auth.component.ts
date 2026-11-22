import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  selectedRole = signal<UserRole>('PRODUCTOR');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Form fields
  email = signal<string>('mateo@aynicacao.bo');
  password = signal<string>('123456');
  fullName = signal<string>('Mateo Mamani Ticona');
  ciNumber = signal<string>('6543210-LP');
  community = signal<string>('Sapecho (Alto Beni)');
  cooperative = signal<string>('Central de Cooperativas El Ceibo');
  phone = signal<string>('+59171234567');
  parcelHectares = signal<number>(4.5);

  setMode(newMode: 'login' | 'register'): void {
    this.mode.set(newMode);
    this.errorMessage.set(null);
    if (newMode === 'login') {
      this.email.set('mateo@aynicacao.bo');
      this.password.set('123456');
    } else {
      this.email.set('nuevo.productor@aynicacao.bo');
      this.password.set('123456');
    }
  }

  setRole(role: UserRole): void {
    this.selectedRole.set(role);
  }

  onSubmit(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.mode() === 'login') {
      this.authService.login({
        email: this.email(),
        password: this.password(),
      }).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.redirectAfterAuth(res.user.role);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Error al iniciar sesión');
        },
      });
    } else {
      this.authService.register({
        email: this.email(),
        password: this.password(),
        full_name: this.fullName(),
        role: this.selectedRole(),
        ci_number: this.ciNumber(),
        community: this.community(),
        cooperative: this.cooperative(),
        phone: this.phone(),
        parcel_hectares: this.parcelHectares(),
      }).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.redirectAfterAuth(res.user.role);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Error al registrar usuario');
        },
      });
    }
  }

  loginWithPollarOAuth(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.pollarOAuth({
      email: 'mateo@aynicacao.bo',
      full_name: 'Mateo Mamani Ticona',
      role: 'PRODUCTOR',
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.redirectAfterAuth(res.user.role);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Error en autenticación Pollar');
      },
    });
  }

  quickDemoLogin(role: UserRole): void {
    this.authService.switchRoleDemo(role);
    this.redirectAfterAuth(role);
  }

  private redirectAfterAuth(role: UserRole): void {
    if (role === 'PRODUCTOR') {
      this.router.navigate(['/mi-parcela']);
    } else if (role === 'ACOPIADOR') {
      this.router.navigate(['/acopio']);
    } else {
      this.router.navigate(['/overview']);
    }
  }
}

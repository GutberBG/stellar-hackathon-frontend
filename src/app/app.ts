import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StateService } from './core/services/state.service';
import { ApiService } from './core/services/api.service';
import { AnimatedCounterComponent } from './shared/components/animated-counter/animated-counter.component';

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

  readonly navItems = [
    { path: '/acopio', label: 'Acopio' },
    { path: '/factoring', label: 'Oráculo IA' },
    { path: '/settlement', label: 'Liquidación' },
  ];
}

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'acopio',
    pathMatch: 'full',
  },
  {
    path: 'acopio',
    loadComponent: () =>
      import('./features/acopio/acopio.component').then((m) => m.AcopioComponent),
    title: 'Ayni Cacao · Registro de Acopio & Boleta Transparente',
  },
  {
    path: 'factoring',
    loadComponent: () =>
      import('./features/oracle-factoring/oracle-factoring.component').then(
        (m) => m.OracleFactoringComponent
      ),
    title: 'Ayni Cacao · Oráculo Climático & Factoring Predictivo',
  },
  {
    path: 'settlement',
    loadComponent: () =>
      import('./features/settlement/settlement.component').then(
        (m) => m.SettlementComponent
      ),
    title: 'Ayni Cacao · Desembolso DeFi & Cobro QR Pollar',
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./features/overview/overview.component').then((m) => m.OverviewComponent),
    title: 'Ayni Cacao · Resumen de Liquidez',
  },
  {
    path: '**',
    redirectTo: 'acopio',
  },
];

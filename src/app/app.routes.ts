import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'acopio',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
    title: 'Ayni Cacao · Acceso & Registro Pollar',
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
    title: 'Ayni Cacao · Resumen de Liquidez Pool Vaquita',
  },
  {
    path: 'mi-parcela',
    loadComponent: () =>
      import('./features/mi-parcela/mi-parcela.component').then(
        (m) => m.MiParcelaComponent
      ),
    title: 'Ayni Cacao · Mi Parcela & Certificación EUDR',
  },
  {
    path: 'mis-operaciones',
    loadComponent: () =>
      import('./features/mis-operaciones/mis-operaciones.component').then(
        (m) => m.MisOperacionesComponent
      ),
    title: 'Ayni Cacao · Mis Operaciones & Cobro QR',
  },
  {
    path: '**',
    redirectTo: 'acopio',
  },
];

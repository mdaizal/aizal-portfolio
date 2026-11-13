import { Routes } from '@angular/router';

/**
 * Single-page site (PRD §6): the home page carries every section as an anchor.
 * A separate `404` route is prerendered and wired to CloudFront custom error
 * responses; the wildcard route renders the same component for any unmatched path.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];

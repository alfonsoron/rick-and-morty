import { Routes } from '@angular/router';
import { authGuard } from './user/guard/auth.guard';
import { guestGuard } from './user/guard/guest.guard';
import { AppRoute } from './shared/enums/routes.enums';

export const routes: Routes = [
  {
    path: AppRoute.Start,
    canActivate: [guestGuard],
    loadComponent: () => import('./shared/home/start').then((m) => m.Start),
  },
  {
    path: AppRoute.Register,
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./user/pages/register/register/register').then((m) => m.Register),
  },
  {
    path: AppRoute.Login,
    canActivate: [guestGuard],
    loadComponent: () => import('./user/pages/login/login/login').then((m) => m.Login),
  },
  {
    path: AppRoute.Home,
    canMatch: [authGuard],
    loadChildren: () =>
      import('./characters/characters.routes').then((m) => m.CHARACTERS_ROUTES),
  },
  {
    path: AppRoute.NotFound,
    loadComponent: () =>
      import('./characters/pages/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    redirectTo: AppRoute.NotFound,
  },
];

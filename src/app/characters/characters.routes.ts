import { Routes } from '@angular/router';
import { AppRoute, HomeRoute } from '../shared/enums/routes.enums';

/**
 * Rutas del modulo de personajes/episodios. Cada vista se carga de forma
 * diferida (lazy) con loadComponent, generando chunks independientes.
 */
export const CHARACTERS_ROUTES: Routes = [
  {
    path: HomeRoute.Characters,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/characters/characters').then((m) => m.CharactersList),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/onecharacterdetails/character-details').then((m) => m.CharacterDetails),
      },
    ],
  },
  {
    path: HomeRoute.Episodes,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/episode/episode').then((m) => m.Episode),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/oneepisode/one-episode').then((m) => m.OneEpisode),
      },
    ],
  },
  {
    path: HomeRoute.Locations,
    loadComponent: () => import('./pages/locations/locations').then((m) => m.Locations),
  },
  {
    path: HomeRoute.Profile,
    loadComponent: () =>
      import('./pages/profile/profile/profile').then((m) => m.Profile),
  },
  {
    path: AppRoute.NotFound,
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    redirectTo: AppRoute.NotFound,
  },
];

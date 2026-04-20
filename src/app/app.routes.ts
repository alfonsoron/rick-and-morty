import { Routes } from '@angular/router';
import { Start } from './shared/home/start';
import { CharactersList } from './characters/pages/characters/characters';
import { CharacterDetails } from './characters/pages/onecharacterdetails/character-details';
import { Episode } from './characters/pages/episode/episode';
import { Locations } from './characters/pages/locations/locations';
import { NotFound } from './characters/pages/not-found/not-found';
import { Register } from './user/pages/register/register/register';
import { Login } from './user/pages/login/login/login';
import { AuthGuard } from './user/guard/auth.guard';
import { GuestGuard } from './user/guard/guest.guard';
import { AppRoute, HomeRoute } from './shared/enums/routes.enums';
import { Profile } from './characters/pages/profile/profile/profile';
import { OneEpisode } from './characters/pages/oneepisode/one-episode';

export const routes: Routes = [
  {
    path: AppRoute.Start,
    canActivate: [GuestGuard],
    component: Start,
  },
  {
    path: AppRoute.Register,
    canActivate: [GuestGuard],
    component: Register,
  },
  {
    path: AppRoute.Login,
    canActivate: [GuestGuard],
    component: Login,
  },
  {
    path: AppRoute.Home,
    canActivate: [AuthGuard],
    children: [
      {
        path: HomeRoute.Characters,
        children: [
          {
            path: '',
            component: CharactersList,
          },
          {
            path: ':id',
            component: CharacterDetails,
          },
        ],
      },
      {
        path: HomeRoute.Episodes,
        children: [
          {
            path: '',
            component: Episode,
          },
          {
            path: ':id',
            component: OneEpisode,
          },
        ],
      },
      {
        path: HomeRoute.Locations,
        component: Locations,
      },
      {
        path: HomeRoute.Profile,
        component: Profile,
      },
      {
        path: AppRoute.NotFound,
        component: NotFound,
      },
      {
        path: '**',
        redirectTo: AppRoute.NotFound,
      },
    ],
  },
  {
    path: AppRoute.NotFound,
    component: NotFound,
  },
  {
    path: '**',
    redirectTo: AppRoute.NotFound,
  },
];

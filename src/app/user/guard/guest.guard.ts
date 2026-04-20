import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppRoute, HomeRoute } from '../../shared/enums/routes.enums';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = localStorage.getItem('currentUser');

    if (user) {
      this.router.navigate([AppRoute.Home, HomeRoute.Characters]);
      return false;
    }

    return true;
  }
}

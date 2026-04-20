import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppRoute } from '../../shared/enums/routes.enums';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = localStorage.getItem('currentUser');

    if (!user) {
      this.router.navigate([AppRoute.Login]);
      return false;
    }

    return true;
  }
}

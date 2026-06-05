import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AppRoute } from '../../shared/enums/routes.enums';
import { AuthService } from '../service/info-user.service';

/**
 * Guard funcional de tipo canMatch: al usarse con canMatch, si el usuario no
 * esta autenticado el modulo (chunk lazy) ni siquiera se descarga.
 */
export const authGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([AppRoute.Login]);
};

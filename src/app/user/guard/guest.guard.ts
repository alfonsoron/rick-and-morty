import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRoute, HomeRoute } from '../../shared/enums/routes.enums';
import { AuthService } from '../service/info-user.service';

/**
 * Guard de rutas publicas (login, register, start). Si el usuario ya esta
 * autenticado lo redirige al dashboard.
 *
 * Se usa como canActivate (no canMatch) a proposito: al ir a una ruta
 * protegida, la ruta vacia '' no debe interceptar la navegacion y generar
 * un bucle de redireccion.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([AppRoute.Home, HomeRoute.Characters]);
};

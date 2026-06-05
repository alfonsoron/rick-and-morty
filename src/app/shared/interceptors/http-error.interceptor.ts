import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * Interceptor encargado de capturar todas las respuestas HTTP con error
 * y notificar al usuario mediante alertas (snackbar de Material).
 *
 * Cumple con:
 *  - Capturar las respuestas de las peticiones.
 *  - Indicar mediante alertas si el e-mail y/o contrasena no son validos.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = resolveErrorMessage(req.url, error);
      if (message) {
        notification.error(message);
      }
      return throwError(() => error);
    }),
  );
};

function resolveErrorMessage(url: string, error: HttpErrorResponse): string | null {
  const isLoginRequest = url.includes('/user/login');
  const isRegisterRequest = url.includes('/user/register');

  if (isLoginRequest && (error.status === 400 || error.status === 401)) {
    return 'El e-mail y/o la contrasena ingresados no son validos.';
  }

  if (isRegisterRequest && error.status === 409) {
    return 'Ya existe un usuario registrado con ese e-mail.';
  }

  // El 409 de favoritos lo maneja el propio servicio (re-sincroniza), no alertamos.
  if (url.includes('/favorite-episodes') && error.status === 409) {
    return null;
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Intenta nuevamente.';
  }

  const apiMessage = error.error?.header?.message ?? error.error?.message;
  return apiMessage || 'Ocurrio un error inesperado. Intenta nuevamente.';
}

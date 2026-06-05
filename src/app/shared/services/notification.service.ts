import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Wrapper sobre MatSnackBar (Angular Material) para mostrar alertas
 * de forma centralizada en toda la aplicacion.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  error(message: string): void {
    this.show(message, 'snackbar-error');
  }

  success(message: string): void {
    this.show(message, 'snackbar-success');
  }

  private show(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}

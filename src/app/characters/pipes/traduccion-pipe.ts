import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'traduccion',
})
export class TraduccionPipe implements PipeTransform {

  transform(value?: string): string {
    if (!value) return 'Desconocido';
    if (value === 'Male') return 'Masculino';
    if (value === 'Female') return 'Femenino';
    if (value === 'Genderless') return 'Sin género';
    if (value === 'Alive') return 'Vivo';
    if (value === 'Dead') return 'Muerto';
    if (value === 'unknown') return 'Desconocido';
    return value

  }

}

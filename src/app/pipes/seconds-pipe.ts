import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'seconds',
})
export class SecondsPipe implements PipeTransform {
  transform(value: number): string {
    const seconds = value % 60;
    return `${Math.floor(value / 60)}:${seconds.toString().padStart(2, '0')}`;
  }
}

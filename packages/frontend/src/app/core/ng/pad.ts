import { NgModule, Pipe, PipeTransform } from '@angular/core';

export function pad(num: number | string, size = 2): string {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

@Pipe({
  name: 'pad',
})
export class PadPipe implements PipeTransform {
  transform(value: number | string): string {
    return pad(value);
  }
}

const DIRECTIVES = [PadPipe];

@NgModule({
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class PadModule {}

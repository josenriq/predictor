import { NgModule, Pipe, PipeTransform } from '@angular/core';

export function initials(name: string): string {
  return (name ?? '')
    .toUpperCase()
    .split(/\s+/)
    .map(s => s.substring(0, 1))
    .slice(0, 2)
    .join('');
}

@Pipe({
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  transform(value: string): string {
    return typeof value === 'string' ? initials(value) : value;
  }
}

const DIRECTIVES = [InitialsPipe];

@NgModule({
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class InitialsModule {}

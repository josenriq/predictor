import { SimpleChange } from '@angular/core';

export function didChange(change: SimpleChange): boolean {
  return (
    change &&
    !change.isFirstChange() &&
    change.previousValue !== change.currentValue
  );
}

// taken from https://github.com/angular/components/blob/master/src/cdk/clipboard
import {
  NgModule,
  Inject,
  Injectable,
  InjectionToken,
  Directive,
  Input,
  Output,
  EventEmitter,
  NgZone,
  Optional,
  OnDestroy,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Maybe } from '../maybe';

export class PendingCopy {
  private textarea: Maybe<HTMLTextAreaElement>;

  constructor(text: string, private readonly document: Document) {
    const textarea = this.createTextArea(text);
    this.textarea = textarea;
    this.document.body.appendChild(textarea);
  }

  copy(): boolean {
    const textarea = this.textarea;
    try {
      // Older browsers could throw if copy is not supported.
      if (!textarea) return false;
      const focus = this.document
        .activeElement as unknown as Maybe<HTMLOrSVGElement>;
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const result = this.document.execCommand('copy');
      if (focus) focus.focus();
      return result;
    } catch {
      return false;
    }
  }

  destroy(): void {
    const textarea = this.textarea;
    if (!textarea) return;
    if (!!textarea.parentNode) textarea.parentNode.removeChild(textarea);
    this.textarea = void 0;
  }

  private createTextArea(text: string): HTMLTextAreaElement {
    const textarea = this.document.createElement('textarea');
    const style = textarea.style;
    style.position = 'fixed';
    style.opacity = '0';
    style.top = '0';
    style.left = '-999em';

    textarea.setAttribute('aria-hidden', 'true');
    textarea.value = text;
    return textarea;
  }
}

@Injectable({ providedIn: 'root' })
export class Clipboard {
  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  copy(text: string): boolean {
    const pending = this.beginCopy(text);
    const result = pending.copy();
    pending.destroy();
    return result;
  }

  beginCopy(text: string): PendingCopy {
    return new PendingCopy(text, this.document);
  }
}

export type ClipboardOptions = { attemps: number };
export const CLIPBOARD_OPTIONS = new InjectionToken<ClipboardOptions>(
  'app-clipboard-options',
);

@Directive({
  selector: '[app-copy-to-clipboard]',
  host: {
    '(click)': 'copy()',
  },
})
export class CopyToClipboardDirective implements OnDestroy {
  @Input('app-copy-to-clipboard') text = '';
  @Output() copied = new EventEmitter<boolean>();

  private readonly pendings = new Set<PendingCopy>();
  private readonly attempts!: number;
  private destroyed!: boolean;
  private timeout: any;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly zone: NgZone,
    @Optional() @Inject(CLIPBOARD_OPTIONS) config?: Maybe<ClipboardOptions>,
  ) {
    if (config && config.attemps != null) {
      this.attempts = config.attemps;
    }
  }

  copy(attemps = this.attempts): void {
    if (attemps < 2) {
      this.copied.emit(this.clipboard.copy(this.text));
      return;
    }

    let remaining = attemps;
    const pending = this.clipboard.beginCopy(this.text);
    this.pendings.add(pending);

    const attemp = (): void => {
      const result = pending.copy();
      if (!result && --remaining && !this.destroyed) {
        this.timeout = this.zone.runOutsideAngular(() => setTimeout(attemp, 1));
        return;
      }

      this.timeout = void 0;
      this.pendings.delete(pending);
      pending.destroy();
      this.copied.emit(result);
    };
    attemp();
  }

  ngOnDestroy(): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.pendings.forEach(pending => pending.destroy());
    this.pendings.clear();
    this.destroyed = true;
  }
}

const DIRECTIVES = [CopyToClipboardDirective];

@NgModule({
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class ClipboardModule {}

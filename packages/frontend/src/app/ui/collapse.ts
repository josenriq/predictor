import { CommonModule } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  NgModule,
  HostBinding,
  Input,
  OnChanges,
  ElementRef,
  Renderer2,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

const ANIMATION_DURATION_MS = 300;

function delayFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
function delayTime(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

@Component({
  selector: 'app-collapse',
  template: `<div #wrapper><ng-content></ng-content></div>`,
  styles: [
    `
      :host {
        transition: max-height 300ms ease;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapseComponent implements OnChanges, AfterViewInit {
  @HostBinding('class') class = `tw-block tw-overflow-hidden`;
  @ViewChild('wrapper', { read: ElementRef }) wrapper!: ElementRef<Element>;

  @Input() collapsed!: boolean;

  private hasInit = false;

  constructor(
    private readonly element: ElementRef<Element>,
    private readonly renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    if (this.collapsed) {
      const el = this.element?.nativeElement;
      const wrapper = this.wrapper?.nativeElement;
      if (el && wrapper) {
        this.renderer.setStyle(el, 'max-height', '0px');
        this.renderer.setStyle(wrapper, 'display', 'none');
      }
    }
    this.hasInit = true;
  }

  ngOnChanges(): void {
    if (this.hasInit) this.animateCollapse();
  }

  private async animateCollapse(): Promise<void> {
    const el = this.element?.nativeElement;
    const wrapper = this.wrapper?.nativeElement;
    if (!el || !wrapper) return;

    this.renderer.setStyle(wrapper, 'display', 'block');
    await delayFrame();

    const collapsedHeight = '0px';
    const expandedHeight = el.scrollHeight + 'px';

    const [from, to] = this.collapsed
      ? [expandedHeight, collapsedHeight]
      : [collapsedHeight, expandedHeight];

    this.renderer.setStyle(el, 'max-height', from);
    await delayFrame();

    this.renderer.setStyle(el, 'max-height', to);
    await delayTime(ANIMATION_DURATION_MS + 10);

    if (this.collapsed) {
      this.renderer.setStyle(wrapper, 'display', 'none');
    } else {
      // XXX: Clear max-height when expanded
      // The contents may grow or shrink in height over time, so
      // the max-height must be removed to avoid visual glitches.
      this.renderer.removeStyle(el, 'max-height');
    }
  }
}

const DIRECTIVES = [CollapseComponent];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES,
})
export class CollapseModule {}

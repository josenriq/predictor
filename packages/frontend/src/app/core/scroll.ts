import { Maybe } from './maybe';

export function findScrollContainer(element?: HTMLElement): Maybe<HTMLElement> {
  if (!element || !window || !window.getComputedStyle) return null;
  const style = window.getComputedStyle(element);
  if (style.overflow === 'auto' || style.overflowY === 'auto') return element;
  return findScrollContainer(element.parentElement ?? void 0);
}

export type ScrollToOptions = {
  container?: HTMLElement;
  smooth?: boolean;
  delay?: number;
  offset?: number;
};

export function scrollTo(
  element: HTMLElement,
  options: ScrollToOptions = {},
): Promise<void> {
  const delay = options.delay ?? 0;
  const smooth = options.smooth ?? false;
  const offset = options.offset ?? 100;
  return new Promise(resolve => {
    setTimeout(() => {
      const container =
        options.container ?? findScrollContainer(element) ?? window;
      let top = 0;
      if (element) {
        top = element.offsetTop - ((container as any).offsetTop ?? 0) - offset;
      }

      if (isNaN(top)) top = 0;

      if (top !== ((container as any).scrollTop ?? 0)) {
        try {
          container.scrollTo({
            top,
            behavior: smooth ? 'smooth' : 'auto',
          });
        } catch (error) {
          console.warn('scrollTo failed', error);
          if (container instanceof HTMLElement) container.scrollTop = top;
        }
      }
      resolve();
    }, Math.max(0, delay));
  });
}

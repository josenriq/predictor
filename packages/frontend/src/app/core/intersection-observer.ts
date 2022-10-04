import { Observable } from 'rxjs';

const supports = 'IntersectionObserver' in window;

export function inView(
  element: Element,
  options: IntersectionObserverInit = {
    root: null,
    threshold: 0.5,
  },
): Observable<boolean> {
  return new Observable(observer => {
    if (!supports) {
      observer.next(true);
      observer.complete();
      return (): void => {};
    }

    const intersection = new IntersectionObserver(([entry]) => {
      observer.next(entry.isIntersecting);
    }, options);

    intersection.observe(element);
    return (): void => intersection.disconnect();
  });
}

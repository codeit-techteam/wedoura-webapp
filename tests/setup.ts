import "@testing-library/jest-dom/vitest";

// jsdom lacks a few browser APIs the components touch on mount.
if (typeof window !== "undefined") {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }
  class Noop {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = Noop as unknown as typeof IntersectionObserver;
  }
  if (!window.ResizeObserver) {
    window.ResizeObserver = Noop as unknown as typeof ResizeObserver;
  }
  if (!window.scrollTo) window.scrollTo = () => {};
}

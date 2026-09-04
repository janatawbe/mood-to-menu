import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Without `test.globals: true`, @testing-library/react's own built-in auto-cleanup
// (which looks for a global `afterEach`) never fires, so each test's rendered DOM stays
// in `document.body` and later queries like `getByText` spuriously match elements left
// over from earlier tests in the same file. Registering it explicitly avoids needing
// vitest's global-injection mode at all.
afterEach(() => {
  cleanup();
});

// jsdom implements neither API — both are used by Motion (useReducedMotion /
// layoutId-based shared-element transitions) throughout the shell and Today's Menu.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

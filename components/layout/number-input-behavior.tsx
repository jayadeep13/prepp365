"use client";

import { useEffect } from "react";

/**
 * Site-wide tweaks for <input type="number"> (prices, MRP, marks, durations…):
 *  - Selects the contents on focus, so typing "10" into a box showing "0"
 *    replaces it instead of producing "010".
 *  - Ignores the mouse wheel while focused, so scrolling the page can't
 *    silently change a price.
 */
export function NumberInputBehavior() {
  useEffect(() => {
    const isNumberInput = (el: EventTarget | null): el is HTMLInputElement =>
      el instanceof HTMLInputElement && el.type === "number";

    const onFocus = (e: FocusEvent) => {
      if (isNumberInput(e.target)) {
        const input = e.target;
        // Defer so the browser's own caret placement on click doesn't undo the selection.
        requestAnimationFrame(() => input.select());
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (isNumberInput(e.target) && document.activeElement === e.target) e.target.blur();
    };

    document.addEventListener("focusin", onFocus);
    document.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("wheel", onWheel);
    };
  }, []);

  return null;
}

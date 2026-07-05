"use client";

import { useEffect, useState } from "react";

/**
 * Returns a value that only updates after it has been stable for `delay` ms.
 * Used to debounce search inputs before they hit the API.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

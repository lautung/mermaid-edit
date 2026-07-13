import { useEffect, useState } from "react";

export function useJsonLocalStorage<T>(
  key: string,
  fallback: T,
  normalize: (value: unknown) => T = (value) => value as T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) {
        return fallback;
      }

      return normalize(JSON.parse(stored));
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Browser persistence is best-effort; keep the in-memory state usable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

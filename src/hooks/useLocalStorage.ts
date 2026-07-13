import { useEffect, useState } from "react";

export function useLocalStorage(key: string, fallback: string) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ?? fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Browser persistence is best-effort; keep the in-memory state usable.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

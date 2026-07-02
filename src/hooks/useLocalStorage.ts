import { useEffect, useState } from "react";

export function useLocalStorage(key: string, fallback: string) {
  const [value, setValue] = useState(() => {
    const stored = window.localStorage.getItem(key);
    return stored ?? fallback;
  });

  useEffect(() => {
    window.localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

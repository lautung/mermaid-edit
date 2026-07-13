// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

function StringStorageProbe({ storageKey = "test:key" }: { storageKey?: string }) {
  const [value, setValue] = useLocalStorage(storageKey, "fallback");

  return (
    <button type="button" onClick={() => setValue("updated")}>
      {value}
    </button>
  );
}

let storage: Storage;
let storageValues: Map<string, string>;

beforeEach(() => {
  storageValues = new Map();
  storage = createStorage();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useLocalStorage", () => {
  it("reads an existing string value", () => {
    storage.setItem("test:key", "stored");

    render(<StringStorageProbe />);

    expect(screen.getByRole("button").textContent).toBe("stored");
  });

  it("falls back when localStorage read throws", () => {
    vi.spyOn(storage, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    render(<StringStorageProbe />);

    expect(screen.getByRole("button").textContent).toBe("fallback");
  });

  it("keeps in-memory state when localStorage write throws", () => {
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    render(<StringStorageProbe />);

    act(() => {
      screen.getByRole("button").click();
    });

    expect(screen.getByRole("button").textContent).toBe("updated");
  });
});

function createStorage(): Storage {
  return {
    get length() {
      return storageValues.size;
    },
    clear: vi.fn(() => storageValues.clear()),
    getItem: vi.fn((key: string) => storageValues.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(storageValues.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => storageValues.delete(key)),
    setItem: vi.fn((key: string, value: string) => {
      storageValues.set(key, value);
    }),
  };
}

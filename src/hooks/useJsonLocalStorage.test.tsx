// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useJsonLocalStorage } from "./useJsonLocalStorage";

type StoredValue = {
  count: number;
};

const fallback: StoredValue = { count: 1 };

function JsonStorageProbe({
  normalize,
}: {
  normalize?: (value: unknown) => StoredValue;
}) {
  const [value, setValue] = useJsonLocalStorage<StoredValue>(
    "test:json",
    fallback,
    normalize,
  );

  return (
    <button type="button" onClick={() => setValue({ count: 3 })}>
      {value.count}
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

describe("useJsonLocalStorage", () => {
  it("reads valid JSON values", () => {
    storage.setItem("test:json", JSON.stringify({ count: 2 }));

    render(<JsonStorageProbe />);

    expect(screen.getByRole("button").textContent).toBe("2");
  });

  it("falls back when localStorage read throws", () => {
    vi.spyOn(storage, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    render(<JsonStorageProbe />);

    expect(screen.getByRole("button").textContent).toBe("1");
  });

  it("falls back when stored JSON is invalid", () => {
    storage.setItem("test:json", "{bad json");

    render(<JsonStorageProbe />);

    expect(screen.getByRole("button").textContent).toBe("1");
  });

  it("normalizes parsed values before exposing them", () => {
    storage.setItem("test:json", JSON.stringify({ count: "bad" }));

    render(
      <JsonStorageProbe
        normalize={(value) =>
          typeof value === "object" && value !== null && "count" in value
            ? { count: Number((value as { count: unknown }).count) || 9 }
            : fallback
        }
      />,
    );

    expect(screen.getByRole("button").textContent).toBe("9");
  });

  it("keeps in-memory state when localStorage write throws", () => {
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    render(<JsonStorageProbe />);

    act(() => {
      screen.getByRole("button").click();
    });

    expect(screen.getByRole("button").textContent).toBe("3");
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

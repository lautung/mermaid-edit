// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import mermaid from "mermaid";
import type { ParseResult } from "mermaid";
import { App } from "./App";

vi.mock("mermaid", () => ({
  default: {
    registerLayoutLoaders: vi.fn(),
    initialize: vi.fn(),
    parse: vi.fn(),
    render: vi.fn(),
  },
}));

vi.mock("./components/MermaidCodeEditor", async () => {
  const React = await import("react");

  return {
    MermaidCodeEditor: React.forwardRef(function MermaidCodeEditorStub(
      { ariaLabel }: { ariaLabel?: string },
      ref,
    ) {
      React.useImperativeHandle(ref, () => ({
        focusLine: vi.fn(),
        insertAtCursor: vi.fn(),
        insertAfterLine: vi.fn(),
      }));
      return <div aria-label={ariaLabel} />;
    }),
  };
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

describe("App internationalization", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
        removeItem: vi.fn((key: string) => storage.delete(key)),
        clear: vi.fn(() => storage.clear()),
      },
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    Object.defineProperty(window.navigator, "languages", {
      configurable: true,
      value: ["zh-CN"],
    });
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "zh-CN",
    });
    const parseResult: ParseResult = { diagramType: "flowchart", config: {} };
    vi.mocked(mermaid.parse).mockResolvedValue(parseResult);
    vi.mocked(mermaid.render).mockResolvedValue({
      svg: "<svg viewBox='0 0 120 80'></svg>",
      diagramType: "flowchart",
    });
  });

  test("switches the editor chrome and template metadata locale", async () => {
    render(<App />);

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "界面语言" }));
    fireEvent.click(await screen.findByText("English"));

    expect(await screen.findByRole("heading", { name: "Mermaid Online Editor" })).not.toBeNull();
    expect(screen.getByText("Template library")).not.toBeNull();
    expect(screen.getByText("Flowchart - Basic decision")).not.toBeNull();
    expect(screen.getByLabelText("Enter Mermaid code")).not.toBeNull();

    await waitFor(() => {
      expect(window.localStorage.getItem("mermaid-edit:locale")).toBe("en");
    });
  });

  test("detects the browser locale when no locale has been saved", async () => {
    Object.defineProperty(window.navigator, "languages", {
      configurable: true,
      value: ["ja-JP", "en-US"],
    });
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "ja-JP",
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Mermaid オンラインエディター" })).not.toBeNull();
    expect(screen.getByLabelText("Mermaid コードを入力")).not.toBeNull();

    await waitFor(() => {
      expect(window.localStorage.getItem("mermaid-edit:locale")).toBe("ja");
    });
  });

  test("uses the saved locale before the browser locale", async () => {
    window.localStorage.setItem("mermaid-edit:locale", "en");
    Object.defineProperty(window.navigator, "languages", {
      configurable: true,
      value: ["ja-JP"],
    });
    Object.defineProperty(window.navigator, "language", {
      configurable: true,
      value: "ja-JP",
    });

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Mermaid Online Editor" })).not.toBeNull();
    expect(screen.getByLabelText("Enter Mermaid code")).not.toBeNull();
  });
});

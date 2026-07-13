// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
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
});

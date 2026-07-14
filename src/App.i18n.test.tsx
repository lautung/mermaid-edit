// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import mermaid from "mermaid";
import type { ParseResult } from "mermaid";
import { MemoryRouter } from "react-router";
import { App } from "./App";
import { messages } from "./i18n/messages";

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
    renderApp();

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

    renderApp();

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

    renderApp();

    expect(await screen.findByRole("heading", { name: "Mermaid Online Editor" })).not.toBeNull();
    expect(screen.getByLabelText("Enter Mermaid code")).not.toBeNull();
  });

  test("initializes lightweight view state from URL search params", async () => {
    renderApp(["/?type=class&q=服务&tab=export&zoom=150&scale=3&filename=demo"]);

    expect(await screen.findByRole("heading", { name: "Mermaid 在线编辑器" })).not.toBeNull();
    expect((screen.getByPlaceholderText("搜索模板") as HTMLInputElement).value).toBe("服务");
    expect(screen.getByRole("button", { name: "类图" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("tab", { name: /导出检查/ }).getAttribute("aria-selected")).toBe("true");
    expect((screen.getByRole("textbox", { name: "文件名" }) as HTMLInputElement).value).toBe("demo");
    expect(screen.getAllByText("150%").length).toBeGreaterThan(0);
    expect(screen.getByText("导出倍率：3x")).not.toBeNull();
  });

  test.each([
    ["ja", "図の設定", "テーマ", "プレビュー倍率 100%", "レンダリング完了"],
    ["ko", "다이어그램 설정", "테마", "미리보기 확대 100%", "렌더링 완료"],
    ["ru", "Настройки диаграммы", "Тема", "Масштаб предпросмотра 100%", "Рендеринг завершен"],
  ] as const)(
    "localizes %s settings and status text without falling back to Chinese",
    (locale, settingsTitle, themeLabel, previewZoom, renderReady) => {
      const localized = messages[locale];

      expect(localized.settings.title).toBe(settingsTitle);
      expect(localized.settings.fields.theme).toBe(themeLabel);
      expect(localized.status.previewZoom(100)).toBe(previewZoom);
      expect(localized.render.ready).toBe(renderReady);

      expect(localized.settings.title).not.toBe(messages["zh-CN"].settings.title);
      expect(localized.status.privacy).not.toBe(messages["zh-CN"].status.privacy);
      expect(localized.render.ready).not.toBe(messages["zh-CN"].render.ready);
    },
  );
});

function renderApp(initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  );
}

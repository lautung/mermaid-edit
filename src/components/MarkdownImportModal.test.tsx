// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { I18nProvider } from "../i18n/I18nProvider";
import { messages } from "../i18n/messages";
import { MarkdownImportModal } from "./MarkdownImportModal";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverStub,
});
Object.defineProperty(window, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverStub,
});

describe("MarkdownImportModal", () => {
  afterEach(() => {
    cleanup();
  });

  test("uses the localized Markdown placeholder", () => {
    render(
      <I18nProvider locale="en" onLocaleChange={vi.fn()}>
        <MarkdownImportModal open onClose={vi.fn()} onImport={vi.fn()} />
      </I18nProvider>,
    );

    expect(screen.getByRole("textbox").getAttribute("placeholder")).toBe(
      messages.en.markdownImport.placeholder,
    );
  });
});

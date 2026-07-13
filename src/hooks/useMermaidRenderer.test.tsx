// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import mermaid from "mermaid";
import type { ParseResult, RenderResult } from "mermaid";
import { defaultDiagramSettings } from "../data/settings";
import { messages } from "../i18n/messages";
import type { DiagnosticMessages } from "../i18n/types";
import { useMermaidRenderer } from "./useMermaidRenderer";

vi.mock("mermaid", () => ({
  default: {
    registerLayoutLoaders: vi.fn(),
    initialize: vi.fn(),
    parse: vi.fn(),
    render: vi.fn(),
  },
}));

type PendingRender = {
  resolve: (result: RenderResult) => void;
  reject: (reason?: unknown) => void;
};

const pendingRenders: PendingRender[] = [];

type RenderLocaleMessages = {
  waiting: string;
  empty: string;
  rendering: string;
  ready: string;
  chunkLoadFailed: string;
};

type MermaidRendererLocale = {
  diagnostics: DiagnosticMessages;
  render: RenderLocaleMessages;
};

const zhLocaleMessages: MermaidRendererLocale = {
  diagnostics: messages["zh-CN"].diagnostics,
  render: messages["zh-CN"].render,
};

const enLocaleMessages: MermaidRendererLocale = {
  diagnostics: messages.en.diagnostics,
  render: messages.en.render,
};

function RenderProbe({
  source,
  settings = defaultDiagramSettings,
  localeMessages = zhLocaleMessages,
}: {
  source: string;
  settings?: typeof defaultDiagramSettings;
  localeMessages?: MermaidRendererLocale;
}) {
  const result = useMermaidRenderer(source, settings, localeMessages);

  const diagnostic = result.state.status === "error" ? result.state.diagnostic : undefined;

  return (
    <output
      data-testid="render-result"
      data-status={result.state.status}
      data-svg={result.svg}
      data-message={result.state.message}
      data-diagnostic={diagnostic?.summary}
    />
  );
}

function getRenderResult(container: HTMLElement) {
  return container.querySelector("[data-testid='render-result']") as HTMLElement;
}

async function startScheduledRender() {
  await act(async () => {
    vi.advanceTimersByTime(280);
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function resolveRender(index: number, svg: string) {
  await act(async () => {
    pendingRenders[index].resolve({ svg, diagramType: "flowchart" });
    await Promise.resolve();
  });
}

async function rejectRender(index: number, reason: Error) {
  await act(async () => {
    pendingRenders[index].reject(reason);
    await Promise.resolve();
  });
}

describe("useMermaidRenderer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pendingRenders.length = 0;
    const parseResult: ParseResult = { diagramType: "flowchart", config: {} };
    vi.mocked(mermaid.parse).mockResolvedValue(parseResult);
    vi.mocked(mermaid.render).mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          pendingRenders.push({ resolve, reject });
        }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("keeps the latest successful render when an older request finishes later", async () => {
    const firstSource = "flowchart LR\n  A --> B";
    const latestSource = "flowchart TD\n  A --> C";
    const firstSvg = "<svg data-render='first'></svg>";
    const latestSvg = "<svg data-render='latest'></svg>";
    const { container, rerender } = render(<RenderProbe source={firstSource} />);

    await startScheduledRender();
    rerender(<RenderProbe source={latestSource} />);
    await startScheduledRender();

    await resolveRender(1, latestSvg);
    expect(getRenderResult(container).dataset).toMatchObject({ status: "ready", svg: latestSvg });

    await resolveRender(0, firstSvg);
    expect(getRenderResult(container).dataset).toMatchObject({ status: "ready", svg: latestSvg });
  });

  it("does not pass transparent background into Mermaid theme variables", () => {
    render(<RenderProbe source="flowchart LR\n  A --> B" />);

    expect(mermaid.initialize).toHaveBeenLastCalledWith(
      expect.not.objectContaining({
        themeVariables: expect.objectContaining({ background: "transparent" }),
      }),
    );
  });

  it("rerenders and reinitializes Mermaid when render settings change", async () => {
    const { rerender } = render(<RenderProbe source="flowchart LR\n  A --> B" />);

    await startScheduledRender();
    await resolveRender(0, "<svg data-render='base'></svg>");

    rerender(
      <RenderProbe
        source="flowchart LR\n  A --> B"
        settings={{ ...defaultDiagramSettings, theme: "dark" }}
      />,
    );
    await startScheduledRender();
    await resolveRender(1, "<svg data-render='dark'></svg>");

    expect(mermaid.initialize).toHaveBeenLastCalledWith(
      expect.objectContaining({ theme: "dark" }),
    );
    expect(mermaid.render).toHaveBeenCalledTimes(2);
  });

  it("does not rerender Mermaid when only locale messages change", async () => {
    const { container, rerender } = render(
      <RenderProbe source="flowchart LR\n  A --> B" localeMessages={zhLocaleMessages} />,
    );

    await startScheduledRender();
    await resolveRender(0, "<svg data-render='ready'></svg>");

    expect(mermaid.render).toHaveBeenCalledTimes(1);
    expect(getRenderResult(container).dataset).toMatchObject({
      status: "ready",
      message: "渲染完成",
    });

    rerender(<RenderProbe source="flowchart LR\n  A --> B" localeMessages={enLocaleMessages} />);

    expect(mermaid.render).toHaveBeenCalledTimes(1);
    expect(getRenderResult(container).dataset).toMatchObject({
      status: "ready",
      message: messages.en.render.ready,
      svg: "<svg data-render='ready'></svg>",
    });
  });

  it("relocalizes an existing syntax diagnostic without rerendering Mermaid", async () => {
    vi.mocked(mermaid.parse).mockRejectedValueOnce(new Error("Parse error on line 2"));
    const { container, rerender } = render(
      <RenderProbe source="flowchart TD\n  start[开始] -->" localeMessages={zhLocaleMessages} />,
    );

    await startScheduledRender();

    expect(mermaid.render).not.toHaveBeenCalled();
    expect(getRenderResult(container).dataset.diagnostic).toContain("流程图");

    rerender(
      <RenderProbe source="flowchart TD\n  start[开始] -->" localeMessages={enLocaleMessages} />,
    );

    expect(mermaid.render).not.toHaveBeenCalled();
    expect(getRenderResult(container).dataset.diagnostic).toContain("Flowchart");
  });

  it("ignores an older error after the latest request succeeds", async () => {
    const { container, rerender } = render(<RenderProbe source="flowchart LR\n  A --> B" />);

    await startScheduledRender();
    rerender(<RenderProbe source="flowchart TD\n  A --> C" />);
    await startScheduledRender();

    await resolveRender(1, "<svg data-render='latest'></svg>");
    await rejectRender(0, new Error("old request failed"));

    expect(getRenderResult(container).dataset).toMatchObject({ status: "ready" });
  });

  it("does not restore an older result after the latest source is cleared", async () => {
    const { container, rerender } = render(<RenderProbe source="flowchart LR\n  A --> B" />);

    await startScheduledRender();
    rerender(<RenderProbe source="" />);

    expect(getRenderResult(container).dataset).toMatchObject({ status: "idle", svg: "" });
    await resolveRender(0, "<svg data-render='old'></svg>");
    expect(getRenderResult(container).dataset).toMatchObject({ status: "idle", svg: "" });
  });

  it("adds a structured syntax diagnostic to the latest parse error", async () => {
    vi.mocked(mermaid.parse).mockRejectedValueOnce(new Error("Parse error on line 2"));
    const { container } = render(<RenderProbe source="flowchart TD\n  start[开始] -->" />);

    await startScheduledRender();

    expect(getRenderResult(container).dataset).toMatchObject({
      status: "error",
      diagnostic: expect.stringContaining("流程图"),
    });
  });

  it("retries once when a chunk load fails", async () => {
    vi.mocked(mermaid.render).mockRejectedValueOnce(
      new TypeError("Failed to fetch dynamically imported module: /assets/stateDiagram.js"),
    );
    vi.mocked(mermaid.render).mockResolvedValueOnce({
      svg: "<svg data-render='retry'></svg>",
      diagramType: "state",
    });
    const { container } = render(<RenderProbe source="stateDiagram-v2\n  [*] --> Idle" />);

    await startScheduledRender();

    expect(mermaid.render).toHaveBeenCalledTimes(2);
    expect(getRenderResult(container).dataset).toMatchObject({
      status: "ready",
      svg: "<svg data-render='retry'></svg>",
    });
  });

  it("reports a chunk load failure after the retry also fails", async () => {
    vi.mocked(mermaid.render)
      .mockRejectedValueOnce(
        new TypeError("Failed to fetch dynamically imported module: /assets/stateDiagram.js"),
      )
      .mockRejectedValueOnce(
        new TypeError("Failed to fetch dynamically imported module: /assets/stateDiagram.js"),
      );
    const { container } = render(<RenderProbe source="stateDiagram-v2\n  [*] --> Idle" />);

    await startScheduledRender();

    expect(mermaid.render).toHaveBeenCalledTimes(2);
    expect(getRenderResult(container).dataset).toMatchObject({
      status: "error",
      message: "图表资源加载失败，请刷新页面后重试。",
    });
    expect(getRenderResult(container).dataset.diagnostic).toBeUndefined();
  });

  it("keeps syntax diagnostics if a retry reaches a Mermaid parse error", async () => {
    vi.mocked(mermaid.render).mockRejectedValueOnce(
      new TypeError("Failed to fetch dynamically imported module: /assets/stateDiagram.js"),
    );
    vi.mocked(mermaid.parse).mockResolvedValueOnce({ diagramType: "flowchart", config: {} });
    vi.mocked(mermaid.parse).mockRejectedValueOnce(new Error("Parse error on line 2"));
    const { container } = render(<RenderProbe source="stateDiagram-v2\n  [*] --> Idle" />);

    await startScheduledRender();

    expect(getRenderResult(container).dataset).toMatchObject({
      status: "error",
      diagnostic: expect.stringContaining("Mermaid 语法无法解析"),
    });
  });
});

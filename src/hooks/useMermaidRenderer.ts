import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import elkLayouts from "@mermaid-js/layout-elk";
import { deriveSyntaxDiagnostic } from "../diagnostics/deriveSyntaxDiagnostic";
import { messages } from "../i18n/messages";
import type { DiagnosticMessages } from "../i18n/types";
import type { DiagramSettings, RenderState } from "../types";

mermaid.registerLayoutLoaders(elkLayouts);

type RenderResult = {
  svg: string;
  state: RenderState;
};

type RenderLocaleMessages = {
  waiting: string;
  empty: string;
  rendering: string;
  ready: string;
};

type MermaidRendererLocale = {
  diagnostics: DiagnosticMessages;
  render: RenderLocaleMessages;
};

const renderDelay = 280;
const defaultLocaleMessages: MermaidRendererLocale = {
  diagnostics: messages["zh-CN"].diagnostics,
  render: messages["zh-CN"].render,
};

export function useMermaidRenderer(
  source: string,
  settings: DiagramSettings,
  localeMessages: MermaidRendererLocale = defaultLocaleMessages,
) {
  const renderId = useRef(0);
  const [result, setResult] = useState<RenderResult>({
    svg: "",
    state: { status: "idle", message: localeMessages.render.waiting },
  });

  useEffect(() => {
    const themeVariables =
      settings.background === "transparent" ? undefined : { background: settings.background };

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: settings.theme,
      ...(themeVariables ? { themeVariables } : {}),
      fontFamily: settings.fontFamily,
      layout: settings.layout,
      flowchart: { curve: settings.curve },
      deterministicIds: true,
    });

    const currentId = renderId.current + 1;
    renderId.current = currentId;

    if (!source.trim()) {
      setResult({
        svg: "",
        state: { status: "idle", message: localeMessages.render.empty },
      });
      return;
    }

    setResult((previous) => ({
      ...previous,
      state: { status: "rendering", message: localeMessages.render.rendering },
    }));

    const timer = window.setTimeout(() => {
      void renderDiagram(source, currentId, localeMessages).then((nextResult) => {
        if (renderId.current === currentId) {
          setResult(nextResult);
        }
      });
    }, renderDelay);

    return () => window.clearTimeout(timer);
  }, [localeMessages, source, settings]);

  return result;
}

async function renderDiagram(
  source: string,
  currentId: number,
  localeMessages: MermaidRendererLocale,
): Promise<RenderResult> {
  try {
    await mermaid.parse(source);
    const { svg } = await mermaid.render(`mermaid-output-${currentId}`, source);

    return {
      svg,
      state: { status: "ready", message: localeMessages.render.ready },
    };
  } catch (error) {
    const diagnostic = deriveSyntaxDiagnostic(source, error, localeMessages.diagnostics);

    return {
      svg: "",
      state: {
        status: "error",
        message: diagnostic.rawMessage,
        diagnostic,
      },
    };
  }
}

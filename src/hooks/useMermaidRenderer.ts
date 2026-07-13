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
  chunkLoadFailed: string;
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
  const localeMessagesRef = useRef(localeMessages);
  const lastErrorRef = useRef<{ source: string; error: unknown } | null>(null);
  const [result, setResult] = useState<RenderResult>({
    svg: "",
    state: { status: "idle", message: localeMessages.render.waiting },
  });

  useEffect(() => {
    localeMessagesRef.current = localeMessages;

    setResult((current) => relocalizeResult(current, localeMessages, lastErrorRef.current));
  }, [localeMessages]);

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
  }, [settings]);

  useEffect(() => {
    const currentId = renderId.current + 1;
    renderId.current = currentId;

    if (!source.trim()) {
      lastErrorRef.current = null;
      setResult({
        svg: "",
        state: { status: "idle", message: localeMessagesRef.current.render.empty },
      });
      return;
    }

    lastErrorRef.current = null;
    setResult((previous) => ({
      ...previous,
      state: { status: "rendering", message: localeMessagesRef.current.render.rendering },
    }));

    const timer = window.setTimeout(() => {
      void renderDiagram(source, currentId, () => localeMessagesRef.current).then((nextResult) => {
        if (renderId.current === currentId) {
          if (nextResult.state.status === "error" && nextResult.state.diagnostic) {
            lastErrorRef.current = {
              source,
              error: new Error(nextResult.state.diagnostic.rawMessage),
            };
          }
          setResult(nextResult);
        }
      });
    }, renderDelay);

    return () => window.clearTimeout(timer);
  }, [source, settings]);

  return result;
}

async function renderDiagram(
  source: string,
  currentId: number,
  getLocaleMessages: () => MermaidRendererLocale,
): Promise<RenderResult> {
  try {
    const svg = await renderMermaidSvg(source, currentId);
    const localeMessages = getLocaleMessages();

    return {
      svg,
      state: { status: "ready", message: localeMessages.render.ready },
    };
  } catch (error) {
    if (isDynamicImportLoadError(error)) {
      return renderDiagramAfterChunkRetry(source, currentId, getLocaleMessages);
    }

    const localeMessages = getLocaleMessages();
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

async function renderDiagramAfterChunkRetry(
  source: string,
  currentId: number,
  getLocaleMessages: () => MermaidRendererLocale,
): Promise<RenderResult> {
  try {
    const svg = await renderMermaidSvg(source, currentId);
    const localeMessages = getLocaleMessages();

    return {
      svg,
      state: { status: "ready", message: localeMessages.render.ready },
    };
  } catch (error) {
    const localeMessages = getLocaleMessages();

    if (isDynamicImportLoadError(error)) {
      return {
        svg: "",
        state: {
          status: "error",
          message: localeMessages.render.chunkLoadFailed,
        },
      };
    }

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

async function renderMermaidSvg(source: string, currentId: number) {
  await mermaid.parse(source);
  const { svg } = await mermaid.render(`mermaid-output-${currentId}`, source);

  return svg;
}

function isDynamicImportLoadError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /failed to fetch dynamically imported module|importing a module script failed/i.test(
    error.message,
  );
}

function relocalizeResult(
  result: RenderResult,
  localeMessages: MermaidRendererLocale,
  lastError: { source: string; error: unknown } | null,
): RenderResult {
  switch (result.state.status) {
    case "idle":
      return {
        ...result,
        state: {
          status: "idle",
          message: result.svg ? localeMessages.render.waiting : localeMessages.render.empty,
        },
      };
    case "rendering":
      return {
        ...result,
        state: { status: "rendering", message: localeMessages.render.rendering },
      };
    case "ready":
      return {
        ...result,
        state: { status: "ready", message: localeMessages.render.ready },
      };
    case "error":
      if (!result.state.diagnostic || !lastError) {
        return {
          ...result,
          state: { status: "error", message: localeMessages.render.chunkLoadFailed },
        };
      }

      return {
        svg: "",
        state: {
          status: "error",
          message: result.state.message,
          diagnostic: deriveSyntaxDiagnostic(
            lastError.source,
            lastError.error,
            localeMessages.diagnostics,
          ),
        },
      };
  }
}

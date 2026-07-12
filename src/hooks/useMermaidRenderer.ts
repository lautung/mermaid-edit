import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import elkLayouts from "@mermaid-js/layout-elk";
import { deriveSyntaxDiagnostic } from "../diagnostics/deriveSyntaxDiagnostic";
import type { DiagramSettings, RenderState } from "../types";

mermaid.registerLayoutLoaders(elkLayouts);

type RenderResult = {
  svg: string;
  state: RenderState;
};

const renderDelay = 280;

export function useMermaidRenderer(source: string, settings: DiagramSettings) {
  const renderId = useRef(0);
  const [result, setResult] = useState<RenderResult>({
    svg: "",
    state: { status: "idle", message: "等待输入" },
  });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: settings.theme,
      themeVariables: { background: settings.background },
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
        state: { status: "idle", message: "输入 Mermaid 代码开始渲染" },
      });
      return;
    }

    setResult((previous) => ({
      ...previous,
      state: { status: "rendering", message: "正在渲染..." },
    }));

    const timer = window.setTimeout(() => {
      void renderDiagram(source, currentId).then((nextResult) => {
        if (renderId.current === currentId) {
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
): Promise<RenderResult> {
  try {
    await mermaid.parse(source);
    const { svg } = await mermaid.render(`mermaid-output-${currentId}`, source);

    return {
      svg,
      state: { status: "ready", message: "渲染完成" },
    };
  } catch (error) {
    const diagnostic = deriveSyntaxDiagnostic(source, error);

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

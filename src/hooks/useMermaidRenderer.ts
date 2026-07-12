import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import mermaid from "mermaid";
import elkLayouts from "@mermaid-js/layout-elk";
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

    if (!source.trim()) {
      setResult({
        svg: "",
        state: { status: "idle", message: "输入 Mermaid 代码开始渲染" },
      });
      return;
    }

    const currentId = renderId.current + 1;
    renderId.current = currentId;
    setResult((previous) => ({
      ...previous,
      state: { status: "rendering", message: "正在渲染..." },
    }));

    const timer = window.setTimeout(() => {
      void renderDiagram(source, currentId, renderId).then(setResult);
    }, renderDelay);

    return () => window.clearTimeout(timer);
  }, [source, settings]);

  return result;
}

async function renderDiagram(
  source: string,
  currentId: number,
  renderId: MutableRefObject<number>,
): Promise<RenderResult> {
  try {
    await mermaid.parse(source);
    const { svg } = await mermaid.render(`mermaid-output-${currentId}`, source);

    if (renderId.current !== currentId) {
      return {
        svg: "",
        state: { status: "rendering", message: "正在渲染..." },
      };
    }

    return {
      svg,
      state: { status: "ready", message: "渲染完成" },
    };
  } catch (error) {
    return {
      svg: "",
      state: {
        status: "error",
        message: error instanceof Error ? error.message : "Mermaid 语法错误",
      },
    };
  }
}

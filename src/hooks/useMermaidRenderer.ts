import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import mermaid from "mermaid";
import type { MermaidTheme, RenderState } from "../types";

type RenderResult = {
  svg: string;
  state: RenderState;
};

const renderDelay = 280;

export function useMermaidRenderer(source: string, theme: MermaidTheme) {
  const renderId = useRef(0);
  const [result, setResult] = useState<RenderResult>({
    svg: "",
    state: { status: "idle", message: "等待输入" },
  });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme,
      deterministicIds: true,
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
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
  }, [source, theme]);

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

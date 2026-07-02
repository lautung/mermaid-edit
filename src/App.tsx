import { useState } from "react";
import { EditorPane } from "./components/EditorPane";
import { PreviewPane } from "./components/PreviewPane";
import { StatusBar } from "./components/StatusBar";
import { Toolbar } from "./components/Toolbar";
import { initialDiagram } from "./data/examples";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useMermaidRenderer } from "./hooks/useMermaidRenderer";
import type { ExportFormat, MermaidTheme } from "./types";
import { copySvg, downloadRaster, downloadSvg } from "./utils/exportDiagram";

export function App() {
  const [source, setSource] = useLocalStorage("mermaid-edit:source", initialDiagram);
  const [theme, setTheme] = useState<MermaidTheme>("base");
  const [scale, setScale] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [toast, setToast] = useState("");
  const { svg, state } = useMermaidRenderer(source, theme);
  const canExport = state.status === "ready" && Boolean(svg);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const handleExport = async (format: ExportFormat) => {
    if (!svg) {
      return;
    }

    try {
      if (format === "svg") {
        downloadSvg(svg);
      } else {
        await downloadRaster(svg, format, scale);
      }
      showToast(`已导出 ${format.toUpperCase()}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "导出失败");
    }
  };

  const handleCopySvg = async () => {
    if (!svg) {
      return;
    }

    try {
      await copySvg(svg);
      showToast("SVG 已复制到剪贴板");
    } catch {
      showToast("复制失败，请改用导出 SVG");
    }
  };

  return (
    <main className="appShell">
      <Toolbar
        theme={theme}
        scale={scale}
        renderState={state}
        canExport={canExport}
        onThemeChange={setTheme}
        onScaleChange={setScale}
        onCopySvg={handleCopySvg}
        onExport={handleExport}
        onReset={() => setSource(initialDiagram)}
      />

      <div className="workspace">
        <EditorPane value={source} onChange={setSource} />
        <PreviewPane svg={svg} state={state} zoom={zoom} onZoomChange={setZoom} />
      </div>

      <StatusBar renderState={state} sourceLength={source.length} zoom={zoom} />

      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

import type { RenderState } from "../types";

type PreviewPaneProps = {
  svg: string;
  state: RenderState;
  zoom: number;
  onZoomChange: (zoom: number) => void;
};

export function PreviewPane({ svg, state, zoom, onZoomChange }: PreviewPaneProps) {
  return (
    <section className="pane previewPane" aria-label="Mermaid 预览">
      <div className="paneHeader">
        <div>
          <h2>预览</h2>
          <span>{state.status === "ready" ? "可导出" : state.message}</span>
        </div>
        <label className="zoomControl">
          <span>{zoom}%</span>
          <input
            type="range"
            min={50}
            max={180}
            step={10}
            value={zoom}
            onChange={(event) => onZoomChange(Number(event.target.value))}
          />
        </label>
      </div>

      <div className="previewCanvas">
        {state.status === "error" ? (
          <pre className="errorBox">{state.message}</pre>
        ) : svg ? (
          <div
            className="svgSurface"
            style={{ transform: `scale(${zoom / 100})` }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="emptyState">输入 Mermaid 代码后会在这里显示图表</div>
        )}
      </div>
    </section>
  );
}

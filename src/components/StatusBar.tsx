import type { RenderState } from "../types";

type StatusBarProps = {
  renderState: RenderState;
  sourceLength: number;
  zoom: number;
};

export function StatusBar({ renderState, sourceLength, zoom }: StatusBarProps) {
  return (
    <footer className="statusBar">
      <span className={`statusDot ${renderState.status}`} />
      <span>{renderState.message}</span>
      <span>{sourceLength} 字符</span>
      <span>预览缩放 {zoom}%</span>
      <span>全部在浏览器本地渲染和导出</span>
    </footer>
  );
}

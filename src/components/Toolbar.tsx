import {
  Clipboard,
  Download,
  FileImage,
  FileType,
  Moon,
  RefreshCcw,
  Sun,
} from "lucide-react";
import type { ExportFormat, MermaidTheme, RenderState } from "../types";

type ToolbarProps = {
  theme: MermaidTheme;
  scale: number;
  renderState: RenderState;
  canExport: boolean;
  onThemeChange: (theme: MermaidTheme) => void;
  onScaleChange: (scale: number) => void;
  onCopySvg: () => void;
  onExport: (format: ExportFormat) => void;
  onReset: () => void;
};

const themes: MermaidTheme[] = ["default", "base", "neutral", "forest", "dark"];

export function Toolbar({
  theme,
  scale,
  renderState,
  canExport,
  onThemeChange,
  onScaleChange,
  onCopySvg,
  onExport,
  onReset,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="brand">
        <div className="brandMark">M</div>
        <div>
          <h1>Mermaid 在线编辑器</h1>
          <p>实时预览 · SVG / PNG / JPG 导出</p>
        </div>
      </div>

      <div className="toolbarGroups">
        <label className="field compactField">
          <span>主题</span>
          <select
            value={theme}
            onChange={(event) =>
              onThemeChange(event.target.value as MermaidTheme)
            }
          >
            {themes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field compactField">
          <span>导出倍率</span>
          <select
            value={scale}
            onChange={(event) => onScaleChange(Number(event.target.value))}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
            <option value={4}>4x</option>
          </select>
        </label>

        <div className="buttonGroup" aria-label="导出操作">
          <button type="button" onClick={onCopySvg} disabled={!canExport}>
            <Clipboard size={16} />
            复制 SVG
          </button>
          <button type="button" onClick={() => onExport("svg")} disabled={!canExport}>
            <FileType size={16} />
            SVG
          </button>
          <button type="button" onClick={() => onExport("png")} disabled={!canExport}>
            <FileImage size={16} />
            PNG
          </button>
          <button type="button" onClick={() => onExport("jpg")} disabled={!canExport}>
            <Download size={16} />
            JPG
          </button>
        </div>

        <button type="button" className="iconButton" onClick={onReset} title="恢复示例">
          <RefreshCcw size={17} />
        </button>

        <div className={`statusPill ${renderState.status}`}>
          {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
          {renderState.message}
        </div>
      </div>
    </header>
  );
}

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { Alert, Badge, Empty, Spin, Tabs } from "antd";
import { EyeOutlined, WarningOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import type { RenderState } from "../types";

type PreviewPaneProps = {
  svg: string;
  state: RenderState;
  zoom: number;
  scale: number;
  filename: string;
  background: string;
};

type PreviewSurfaceStyle = CSSProperties & {
  "--preview-width"?: string;
  "--preview-height"?: string;
};

const previewBounds = {
  maxWidth: 1040,
  maxHeight: 560,
  minWidth: 320,
  minHeight: 140,
  maxScrollWidth: 1800,
};

export function PreviewPane({ svg, state, zoom, scale, filename, background }: PreviewPaneProps) {
  const canExport = state.status === "ready" && Boolean(svg);
  const surfaceStyle = useMemo<PreviewSurfaceStyle>(
    () => ({
      zoom: `${zoom}%`,
      ...getPreviewSurfaceSize(svg),
    }),
    [svg, zoom],
  );

  return (
    <section className="workspacePanel previewPane" aria-label="Mermaid 预览">
      <Tabs
        className="panelTabs"
        items={[
          {
            key: "preview",
            label: (
              <span>
                <EyeOutlined /> 预览
              </span>
            ),
            children: null,
          },
          {
            key: "export",
            label: (
              <span>
                <SafetyCertificateOutlined /> 导出检查
              </span>
            ),
            children: null,
          },
          {
            key: "error",
            label: (
              <span>
                <WarningOutlined /> 错误 <Badge count={state.status === "error" ? 1 : 0} />
              </span>
            ),
            children: null,
          },
        ]}
      />

      <div
        className="previewCanvas"
        style={{ background: background === "transparent" ? undefined : background }}
      >
        {state.status === "error" ? (
          <Alert
            className="previewAlert"
            showIcon
            type="error"
            title="Mermaid 语法错误"
            description="请在左侧编辑器中定位并修复语法错误。"
          />
        ) : svg ? (
          <Spin spinning={state.status === "rendering"} tip="正在渲染">
            <div
              className="svgSurface"
              style={surfaceStyle}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </Spin>
        ) : (
          <Empty description="输入 Mermaid 代码后会在这里显示图表" />
        )}
      </div>

      <div className="previewMeta">
        <span>{canExport ? "可导出" : state.status === "error" ? "请在编辑器中修复语法错误" : state.message}</span>
        <span>文件名：{filename || "diagram"}</span>
        <span>导出倍率：{scale}x</span>
      </div>
    </section>
  );
}

function getPreviewSurfaceSize(svg: string): PreviewSurfaceStyle {
  const dimensions = getSvgDimensions(svg);
  if (!dimensions) {
    return {};
  }

  const ratio = dimensions.width / dimensions.height;
  let scale = Math.min(
    previewBounds.maxWidth / dimensions.width,
    previewBounds.maxHeight / dimensions.height,
    1,
  );

  let width = dimensions.width * scale;
  let height = dimensions.height * scale;

  if (ratio >= 0.55 && width < previewBounds.minWidth) {
    scale = previewBounds.minWidth / dimensions.width;
    width = dimensions.width * scale;
    height = dimensions.height * scale;
  }

  if (height < previewBounds.minHeight) {
    scale = Math.min(
      previewBounds.minHeight / dimensions.height,
      previewBounds.maxScrollWidth / dimensions.width,
    );
    width = dimensions.width * scale;
    height = dimensions.height * scale;
  }

  if (height > previewBounds.maxHeight) {
    scale = previewBounds.maxHeight / dimensions.height;
    width = dimensions.width * scale;
    height = dimensions.height * scale;
  }

  return {
    "--preview-width": `${Math.round(width)}px`,
    "--preview-height": `${Math.round(height)}px`,
  };
}

function getSvgDimensions(svg: string) {
  const viewBox = svg.match(/\sviewBox=(["'])(.*?)\1/i)?.[2];
  if (viewBox) {
    const [, , width, height] = viewBox.trim().split(/[\s,]+/).map(Number);
    if (isPositiveNumber(width) && isPositiveNumber(height)) {
      return { width, height };
    }
  }

  const width = readSvgLength(svg, "width");
  const height = readSvgLength(svg, "height");
  return isPositiveNumber(width) && isPositiveNumber(height) ? { width, height } : null;
}

function readSvgLength(svg: string, attribute: "width" | "height") {
  const value = svg.match(new RegExp(`\\s${attribute}=(["'])(.*?)\\1`, "i"))?.[2];
  if (!value || value.trim().endsWith("%")) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return isPositiveNumber(parsed) ? parsed : null;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

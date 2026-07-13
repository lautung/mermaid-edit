import { useMemo } from "react";
import type { CSSProperties } from "react";
import { Alert, Badge, Empty, Spin, Tabs } from "antd";
import { EyeOutlined, WarningOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useI18n } from "../i18n/useI18n";
import type { RenderState } from "../types";
import { getSvgDimensionsFromMarkup } from "../utils/svgDimensions";

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
  const { messages } = useI18n();
  const canExport = state.status === "ready" && Boolean(svg);
  const surfaceStyle = useMemo<PreviewSurfaceStyle>(
    () => ({
      zoom: `${zoom}%`,
      ...getPreviewSurfaceSize(svg),
    }),
    [svg, zoom],
  );

  return (
    <section className="workspacePanel previewPane" aria-label={messages.preview.ariaLabel}>
      <Tabs
        className="panelTabs"
        items={[
          {
            key: "preview",
            label: (
              <span>
                <EyeOutlined /> {messages.preview.previewTab}
              </span>
            ),
            children: null,
          },
          {
            key: "export",
            label: (
              <span>
                <SafetyCertificateOutlined /> {messages.preview.exportCheckTab}
              </span>
            ),
            children: null,
          },
          {
            key: "error",
            label: (
              <span>
                <WarningOutlined /> {messages.preview.errorTab} <Badge count={state.status === "error" ? 1 : 0} />
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
            title={messages.preview.syntaxErrorTitle}
            description={messages.preview.syntaxErrorDescription}
          />
        ) : svg ? (
          <Spin spinning={state.status === "rendering"} tip={messages.common.loading}>
            <div
              className="svgSurface"
              style={surfaceStyle}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </Spin>
        ) : (
          <Empty description={messages.preview.emptyDescription} />
        )}
      </div>

      <div className="previewMeta">
        <span>{canExport ? messages.preview.exportable : state.status === "error" ? messages.preview.fixSyntaxError : state.message}</span>
        <span>{messages.preview.filename(filename || messages.common.diagramFallback)}</span>
        <span>{messages.preview.exportScale(scale)}</span>
      </div>
    </section>
  );
}

function getPreviewSurfaceSize(svg: string): PreviewSurfaceStyle {
  const dimensions = getSvgDimensionsFromMarkup(svg);
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

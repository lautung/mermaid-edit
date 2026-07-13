import { useMemo } from "react";
import type { CSSProperties } from "react";
import { Alert, Badge, Empty, Space, Spin, Tabs, Tag, Typography } from "antd";
import { EyeOutlined, WarningOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useI18n } from "../i18n/useI18n";
import type { PreviewTab, RenderState } from "../types";
import { getSvgDimensionsFromMarkup } from "../utils/svgDimensions";

type PreviewPaneProps = {
  svg: string;
  state: RenderState;
  zoom: number;
  scale: number;
  filename: string;
  background: string;
  activeTab: PreviewTab;
  onActiveTabChange: (tab: PreviewTab) => void;
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

export function PreviewPane({
  svg,
  state,
  zoom,
  scale,
  filename,
  background,
  activeTab,
  onActiveTabChange,
}: PreviewPaneProps) {
  const { messages } = useI18n();
  const canExport = state.status === "ready" && Boolean(svg);
  const hasExportFilename = filename.trim().length > 0 || Boolean(messages.common.diagramFallback);
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
        activeKey={activeTab}
        onChange={(tab) => {
          if (isPreviewTab(tab)) {
            onActiveTabChange(tab);
          }
        }}
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

      {activeTab === "preview" ? (
        <div
          className="previewCanvas"
          style={{ background: background === "transparent" ? undefined : background }}
        >
          {svg ? (
            <Spin spinning={state.status === "rendering"} description={messages.common.loading}>
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
      ) : activeTab === "export" ? (
        <div className="previewTabPanel exportCheckPanel">
          <Typography.Title className="previewTabTitle" level={3}>
            {messages.preview.exportCheckTitle}
          </Typography.Title>
          <Alert
            showIcon
            type={canExport ? "success" : "warning"}
            title={canExport ? messages.preview.exportReady : messages.preview.exportBlocked}
            description={messages.preview.exportCheckDescription}
          />
          <div className="exportCheckList">
            <CheckItem checked={state.status === "ready"} label={messages.preview.exportConditionRendered} />
            <CheckItem checked={Boolean(svg)} label={messages.preview.exportConditionSvg} />
            <CheckItem checked={state.status !== "error"} label={messages.preview.exportConditionSyntax} />
            <CheckItem checked={hasExportFilename} label={messages.preview.exportConditionFilename} />
          </div>
          <Space className="exportCheckMeta" size={[8, 8]} wrap>
            <Tag>{messages.preview.filename(filename || messages.common.diagramFallback)}</Tag>
            <Tag>{messages.preview.exportScale(scale)}</Tag>
          </Space>
        </div>
      ) : (
        <div className="previewTabPanel errorDetailsPanel">
          {state.status === "error" ? (
            <>
              <Alert
                showIcon
                type="error"
                title={messages.preview.syntaxErrorTitle}
                description={messages.preview.syntaxErrorDescription}
              />
              <section className="errorDetailSection">
                <Typography.Text strong>{messages.preview.errorSummary}</Typography.Text>
                <Typography.Paragraph>{state.diagnostic?.summary ?? state.message}</Typography.Paragraph>
                {state.diagnostic?.line !== undefined ? (
                  <Tag color="red">{messages.preview.errorLine(state.diagnostic.line)}</Tag>
                ) : null}
              </section>
              <section className="errorDetailSection">
                <Typography.Text strong>{messages.preview.repairSuggestion}</Typography.Text>
                {state.diagnostic?.rule ? (
                  <>
                    <Space size={[8, 8]} wrap>
                      <Tag color="volcano">{messages.preview.errorRule}</Tag>
                      <Typography.Text code>{state.diagnostic.rule.title}</Typography.Text>
                    </Space>
                    <Typography.Paragraph>{state.diagnostic.manualFixHint}</Typography.Paragraph>
                    <Typography.Paragraph code copyable={{ text: state.diagnostic.rule.snippet }}>
                      {state.diagnostic.rule.snippet}
                    </Typography.Paragraph>
                  </>
                ) : (
                  <Typography.Paragraph>
                    {state.diagnostic?.manualFixHint ?? messages.preview.noRepairSuggestion}
                  </Typography.Paragraph>
                )}
              </section>
              <details className="syntaxAssistantDetails">
                <summary>{messages.preview.technicalDetails}</summary>
                <Typography.Paragraph code>
                  {state.diagnostic?.rawMessage ?? state.message}
                </Typography.Paragraph>
              </details>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  <Typography.Text strong>{messages.preview.noErrorTitle}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">{messages.preview.noErrorDescription}</Typography.Text>
                </span>
              }
            />
          )}
        </div>
      )}
    </section>
  );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="exportCheckItem">
      <Badge status={checked ? "success" : "error"} />
      <span>{label}</span>
    </div>
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

function isPreviewTab(value: string): value is PreviewTab {
  return value === "preview" || value === "export" || value === "error";
}

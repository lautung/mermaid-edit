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

export function PreviewPane({ svg, state, zoom, scale, filename, background }: PreviewPaneProps) {
  const canExport = state.status === "ready" && Boolean(svg);

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
              style={{ transform: `scale(${zoom / 100})` }}
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

import { Alert, Button, Input, Select, Slider, Space, Tag, Typography } from "antd";
import { ReloadOutlined, SettingOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import type { DiagramSettingKey, DiagramSettings } from "../types";
import { getFrontmatterOverrides } from "../utils/mermaidConfig";

type SettingsPanelProps = {
  settings: DiagramSettings;
  scale: number;
  filename: string;
  zoom: number;
  source: string;
  onSettingsChange: <Key extends keyof DiagramSettings>(
    key: Key,
    value: DiagramSettings[Key],
  ) => void;
  onScaleChange: (scale: number) => void;
  onFilenameChange: (filename: string) => void;
  onZoomChange: (zoom: number) => void;
  onResetZoom: () => void;
};

const settingLabels: Record<DiagramSettingKey, string> = {
  theme: "主题",
  background: "背景色",
  fontFamily: "字体",
  layout: "图表布局",
  curve: "连线曲线",
};

const backgroundOptions = [
  { label: "透明", value: "transparent" },
  { label: "白色", value: "#ffffff" },
  { label: "浅灰", value: "#f4f7f6" },
];

export function SettingsPanel({
  settings,
  scale,
  filename,
  zoom,
  source,
  onSettingsChange,
  onScaleChange,
  onFilenameChange,
  onZoomChange,
  onResetZoom,
}: SettingsPanelProps) {
  const overriddenKeys = getOverriddenKeys(source);

  return (
    <aside className="settingsPanel" aria-label="图表设置">
      <div className="settingsHeader">
        <Typography.Title level={5}>图表设置</Typography.Title>
        <SettingOutlined />
      </div>

      <Space direction="vertical" size={18} className="settingsFields">
        <SettingsField label="主题" overridden={overriddenKeys.has("theme")}>
          <Select
            value={settings.theme}
            options={[
              { label: "default", value: "default" },
              { label: "base", value: "base" },
              { label: "neutral", value: "neutral" },
              { label: "forest", value: "forest" },
              { label: "dark", value: "dark" },
            ]}
            onChange={(value) => onSettingsChange("theme", value)}
          />
        </SettingsField>

        <SettingsField label="背景色" overridden={overriddenKeys.has("background")}>
          <div className="backgroundField">
            <Select
              value={backgroundOptions.some((option) => option.value === settings.background) ? settings.background : "custom"}
              options={[...backgroundOptions, { label: "自定义", value: "custom" }]}
              onChange={(value) => {
                if (value !== "custom") {
                  onSettingsChange("background", value);
                }
              }}
            />
            <input
              aria-label="自定义背景色"
              type="color"
              value={settings.background === "transparent" ? "#ffffff" : settings.background}
              onChange={(event) => onSettingsChange("background", event.target.value)}
            />
          </div>
        </SettingsField>

        <SettingsField label="字体" overridden={overriddenKeys.has("fontFamily")}>
          <Select
            value={settings.fontFamily}
            options={[
              { label: "Inter", value: "Inter" },
              { label: "系统字体", value: "system-ui" },
              { label: "等宽字体", value: "monospace" },
            ]}
            onChange={(value) => onSettingsChange("fontFamily", value)}
          />
        </SettingsField>

        <SettingsField label="图表布局" overridden={overriddenKeys.has("layout")}>
          <Select
            value={settings.layout}
            options={[{ label: "Dagre（默认）", value: "dagre" }, { label: "ELK（复杂关系）", value: "elk" }]}
            onChange={(value) => onSettingsChange("layout", value)}
          />
        </SettingsField>

        <SettingsField label="连线曲线" overridden={overriddenKeys.has("curve")}>
          <Select
            value={settings.curve}
            options={[
              { label: "Basis 平滑", value: "basis" },
              { label: "Linear 直线", value: "linear" },
              { label: "Bump X", value: "bumpX" },
              { label: "Monotone X", value: "monotoneX" },
              { label: "Natural 自然", value: "natural" },
              { label: "Step 阶梯", value: "step" },
            ]}
            onChange={(value) => onSettingsChange("curve", value)}
          />
        </SettingsField>

        <SettingsField label="导出比例" overridden={false}>
          <Select
            value={scale}
            options={[1, 2, 3, 4].map((item) => ({ label: `${item}x`, value: item }))}
            onChange={onScaleChange}
          />
        </SettingsField>

        <SettingsField label="文件名" overridden={false}>
          <Input value={filename} onChange={(event) => onFilenameChange(event.target.value)} />
        </SettingsField>

        {overriddenKeys.size > 0 ? (
          <Alert
            showIcon
            type="warning"
            message={`源码已覆盖：${Array.from(overriddenKeys, (key) => settingLabels[key]).join("、")}`}
            description="当前面板配置仍会保存，但渲染时以 Mermaid 源码中的 Frontmatter 为准。"
          />
        ) : null}

        <div>
          <Typography.Text type="secondary">预览缩放</Typography.Text>
          <div className="zoomStepper">
            <Button onClick={() => onZoomChange(Math.max(50, zoom - 10))}>-</Button>
            <Typography.Text>{zoom}%</Typography.Text>
            <Button onClick={() => onZoomChange(Math.min(200, zoom + 10))}>+</Button>
          </div>
          <Slider min={50} max={200} step={10} value={zoom} onChange={onZoomChange} />
          <div className="zoomRange">
            <Typography.Text type="secondary">50%</Typography.Text>
            <Typography.Text type="secondary">100%</Typography.Text>
            <Typography.Text type="secondary">200%</Typography.Text>
          </div>
        </div>

        <Button icon={<ReloadOutlined />} onClick={onResetZoom} block>
          重置视图
        </Button>
      </Space>
    </aside>
  );
}

function SettingsField({
  label,
  overridden,
  children,
}: {
  label: string;
  overridden: boolean;
  children: ReactNode;
}) {
  return (
    <label>
      <span className="settingsLabel">
        <Typography.Text type="secondary">{label}</Typography.Text>
        {overridden ? <Tag color="orange">源码覆盖</Tag> : null}
      </span>
      {children}
    </label>
  );
}

function getOverriddenKeys(source: string) {
  return new Set(getFrontmatterOverrides(source).overriddenKeys);
}

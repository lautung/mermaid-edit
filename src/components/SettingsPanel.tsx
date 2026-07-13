import { Alert, Button, Input, Select, Slider, Space, Tag, Typography } from "antd";
import { ReloadOutlined, SettingOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useI18n } from "../i18n/useI18n";
import type { DiagramSettings } from "../types";
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

const MIN_ZOOM = 50;
const DEFAULT_ZOOM = 100;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

const ZOOM_MARKS = {
  0: "50%",
  10: "",
  20: "",
  30: "",
  40: "",
  50: "100%",
  55: "",
  60: "",
  65: "",
  70: "",
  75: "",
  80: "",
  85: "",
  90: "",
  95: "",
  100: "200%",
};

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
  const { messages } = useI18n();
  const overriddenKeys = useMemo(() => getOverriddenKeys(source), [source]);
  const backgroundOptions = [
    { label: messages.settings.backgroundOptions.transparent, value: "transparent" },
    { label: messages.settings.backgroundOptions.white, value: "#ffffff" },
    { label: messages.settings.backgroundOptions.lightGray, value: "#f4f7f6" },
  ];

  return (
    <aside className="settingsPanel" aria-label={messages.settings.ariaLabel}>
      <div className="settingsHeader">
        <Typography.Title level={5}>{messages.settings.title}</Typography.Title>
        <SettingOutlined />
      </div>

      <Space orientation="vertical" size={18} className="settingsFields">
        <SettingsField label={messages.settings.fields.theme} overridden={overriddenKeys.has("theme")}>
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

        <SettingsField label={messages.settings.fields.background} overridden={overriddenKeys.has("background")}>
          <div className="backgroundField">
            <Select
              value={backgroundOptions.some((option) => option.value === settings.background) ? settings.background : "custom"}
              options={[...backgroundOptions, { label: messages.settings.backgroundOptions.custom, value: "custom" }]}
              onChange={(value) => {
                if (value !== "custom") {
                  onSettingsChange("background", value);
                }
              }}
            />
            <input
              aria-label={messages.settings.customBackgroundAriaLabel}
              type="color"
              value={settings.background === "transparent" ? "#ffffff" : settings.background}
              onChange={(event) => onSettingsChange("background", event.target.value)}
            />
          </div>
        </SettingsField>

        <SettingsField label={messages.settings.fields.fontFamily} overridden={overriddenKeys.has("fontFamily")}>
          <Select
            value={settings.fontFamily}
            options={[
              { label: "Inter", value: "Inter" },
              { label: messages.settings.fontOptions.system, value: "system-ui" },
              { label: messages.settings.fontOptions.monospace, value: "monospace" },
            ]}
            onChange={(value) => onSettingsChange("fontFamily", value)}
          />
        </SettingsField>

        <SettingsField label={messages.settings.fields.layout} overridden={overriddenKeys.has("layout")}>
          <Select
            value={settings.layout}
            options={[
              { label: messages.settings.layoutOptions.dagre, value: "dagre" },
              { label: messages.settings.layoutOptions.elk, value: "elk" },
            ]}
            onChange={(value) => onSettingsChange("layout", value)}
          />
        </SettingsField>

        <SettingsField label={messages.settings.fields.curve} overridden={overriddenKeys.has("curve")}>
          <Select
            value={settings.curve}
            options={[
              { label: messages.settings.curveOptions.basis, value: "basis" },
              { label: messages.settings.curveOptions.linear, value: "linear" },
              { label: messages.settings.curveOptions.bumpX, value: "bumpX" },
              { label: messages.settings.curveOptions.monotoneX, value: "monotoneX" },
              { label: messages.settings.curveOptions.natural, value: "natural" },
              { label: messages.settings.curveOptions.step, value: "step" },
            ]}
            onChange={(value) => onSettingsChange("curve", value)}
          />
        </SettingsField>

        <SettingsField label={messages.settings.fields.scale} overridden={false}>
          <Select
            value={scale}
            options={[1, 2, 3, 4].map((item) => ({ label: `${item}x`, value: item }))}
            onChange={onScaleChange}
          />
        </SettingsField>

        <SettingsField label={messages.settings.fields.filename} overridden={false}>
          <Input value={filename} onChange={(event) => onFilenameChange(event.target.value)} />
        </SettingsField>

        {overriddenKeys.size > 0 ? (
          <Alert
            showIcon
            type="warning"
            message={messages.settings.sourceOverrideMessage(
              Array.from(overriddenKeys, (key) => messages.settings.fields[key]).join("、"),
            )}
            description={messages.settings.sourceOverrideDescription}
          />
        ) : null}

        <div>
          <Typography.Text type="secondary">{messages.settings.previewZoom}</Typography.Text>
          <div className="zoomStepper">
            <Button onClick={() => onZoomChange(Math.max(MIN_ZOOM, zoom - ZOOM_STEP))}>-</Button>
            <Typography.Text>{zoom}%</Typography.Text>
            <Button onClick={() => onZoomChange(Math.min(MAX_ZOOM, zoom + ZOOM_STEP))}>+</Button>
          </div>
          <Slider
            min={0}
            max={100}
            step={null}
            marks={ZOOM_MARKS}
            value={zoomToSliderValue(zoom)}
            onChange={(value) => onZoomChange(sliderValueToZoom(value))}
          />
        </div>

        <Button icon={<ReloadOutlined />} onClick={onResetZoom} block>
          {messages.settings.resetView}
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
  const { messages } = useI18n();

  return (
    <label>
      <span className="settingsLabel">
        <Typography.Text type="secondary">{label}</Typography.Text>
        {overridden ? <Tag color="orange">{messages.settings.sourceOverrideTag}</Tag> : null}
      </span>
      {children}
    </label>
  );
}

function getOverriddenKeys(source: string) {
  return new Set(getFrontmatterOverrides(source).overriddenKeys);
}

function zoomToSliderValue(zoom: number) {
  if (zoom <= DEFAULT_ZOOM) {
    return ((zoom - MIN_ZOOM) / (DEFAULT_ZOOM - MIN_ZOOM)) * 50;
  }

  return 50 + ((zoom - DEFAULT_ZOOM) / (MAX_ZOOM - DEFAULT_ZOOM)) * 50;
}

function sliderValueToZoom(value: number) {
  const zoom =
    value <= 50
      ? MIN_ZOOM + (value / 50) * (DEFAULT_ZOOM - MIN_ZOOM)
      : DEFAULT_ZOOM + ((value - 50) / 50) * (MAX_ZOOM - DEFAULT_ZOOM);

  return Math.round(zoom / ZOOM_STEP) * ZOOM_STEP;
}

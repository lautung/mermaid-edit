import {
  CopyOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FileTextOutlined,
  MenuOutlined,
  PictureOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Badge, Button, Dropdown, Select, Space, Tag, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import { localeOptions } from "../i18n/messages";
import type { LocaleCode } from "../i18n/types";
import { useI18n } from "../i18n/useI18n";
import type { ExportFormat, RenderState } from "../types";

const { Text, Title } = Typography;

type HeaderActionsProps = {
  canExport: boolean;
  source: string;
  statusMessage: string;
  renderState: RenderState;
  onCopySvg: () => void;
  onExport: (format: ExportFormat) => void;
  onExportMarkdown: () => void;
  onResetTemplate: () => void;
};

export function HeaderActions({
  canExport,
  source,
  statusMessage,
  renderState,
  onCopySvg,
  onExport,
  onExportMarkdown,
  onResetTemplate,
}: HeaderActionsProps) {
  const { locale, setLocale, messages } = useI18n();
  const exportItems: MenuProps["items"] = [
    {
      key: "svg",
      label: messages.header.exportSvg,
      icon: <FileTextOutlined />,
      disabled: !canExport,
      onClick: () => onExport("svg"),
    },
    {
      key: "png",
      label: messages.header.exportPng,
      icon: <FileImageOutlined />,
      disabled: !canExport,
      onClick: () => onExport("png"),
    },
    {
      key: "jpg",
      label: messages.header.exportJpg,
      icon: <PictureOutlined />,
      disabled: !canExport,
      onClick: () => onExport("jpg"),
    },
    {
      key: "markdown",
      label: messages.header.exportMarkdown,
      icon: <FileTextOutlined />,
      disabled: !source.trim(),
      onClick: onExportMarkdown,
    },
  ];

  return (
    <>
      <Space align="center" size={12}>
        <img className="brandMark" src="/favicon.svg" alt="" aria-hidden="true" />
        <Title level={3}>{messages.app.title}</Title>
        <Tag color="cyan">{messages.app.localTag}</Tag>
        <Badge status={canExport ? "success" : renderState.status === "error" ? "error" : "processing"} />
        <Text type="secondary">{canExport ? messages.app.saved : statusMessage}</Text>
      </Space>

      <Space className="headerActions">
        <Select
          aria-label={messages.language.label}
          value={locale}
          options={localeOptions.map((option) => ({
            value: option.value,
            label: option.nativeLabel,
          }))}
          onChange={(nextLocale) => setLocale(nextLocale as LocaleCode)}
        />
        <Button icon={<CopyOutlined />} disabled={!canExport} onClick={onCopySvg}>
          {messages.header.copySvg}
        </Button>
        <Dropdown menu={{ items: exportItems }} trigger={["click"]}>
          <Button type="primary" icon={<DownloadOutlined />} disabled={!canExport}>
            {messages.common.export}
          </Button>
        </Dropdown>
        <Tooltip title={messages.header.resetTemplateTooltip}>
          <Button icon={<ReloadOutlined />} onClick={onResetTemplate} />
        </Tooltip>
        <Button icon={<MenuOutlined />} />
      </Space>
    </>
  );
}

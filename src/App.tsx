import { useMemo, useState } from "react";
import {
  App as AntApp,
  Badge,
  Button,
  ConfigProvider,
  Dropdown,
  Grid,
  Input,
  Layout,
  List,
  Select,
  Space,
  Splitter,
  Tag,
  Tooltip,
  Typography,
  theme as antTheme,
} from "antd";
import type { MenuProps } from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FileTextOutlined,
  MenuOutlined,
  PictureOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { EditorPane } from "./components/EditorPane";
import { MarkdownImportModal } from "./components/MarkdownImportModal";
import { PreviewPane } from "./components/PreviewPane";
import { SettingsPanel } from "./components/SettingsPanel";
import { StatusBar } from "./components/StatusBar";
import { TemplateManagerModal } from "./components/TemplateManagerModal";
import { diagramTemplates, initialDiagram } from "./data/examples";
import { defaultDiagramSettings } from "./data/settings";
import { useJsonLocalStorage } from "./hooks/useJsonLocalStorage";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useMermaidRenderer } from "./hooks/useMermaidRenderer";
import { antdLocales } from "./i18n/antdLocales";
import { I18nProvider } from "./i18n/I18nProvider";
import { localeOptions } from "./i18n/messages";
import type { LocaleCode } from "./i18n/types";
import { useI18n } from "./i18n/useI18n";
import type { DiagramSettings, ExportFormat } from "./types";
import { copySvg, downloadMarkdown, downloadRaster, downloadSvg } from "./utils/exportDiagram";
import { formatMermaidMarkdown } from "./utils/markdownMermaid";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const chartTypes = Array.from(new Set(diagramTemplates.map((template) => template.type)));
const localeAliases: Record<string, LocaleCode> = {
  "zh-cn": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-sg": "zh-CN",
  "zh-hk": "zh-HK",
  "zh-hant": "zh-HK",
  "zh-mo": "zh-HK",
  "zh-tw": "zh-HK",
  zh: "zh-CN",
};

export function App() {
  const defaultLocale = useMemo(() => detectBrowserLocale(), []);
  const [storedLocale, setStoredLocale] = useLocalStorage("mermaid-edit:locale", defaultLocale);
  const locale = isLocaleCode(storedLocale) ? storedLocale : "zh-CN";

  return (
    <I18nProvider locale={locale} onLocaleChange={setStoredLocale}>
      <ConfigProvider
        locale={antdLocales[locale]}
        theme={{
          algorithm: antTheme.defaultAlgorithm,
          token: {
            colorPrimary: "#0f8f82",
            borderRadius: 8,
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
            fontFamilyCode:
              "SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace",
          },
        }}
      >
        <AntApp>
          <MermaidEditorApp />
        </AntApp>
      </ConfigProvider>
    </I18nProvider>
  );
}

function MermaidEditorApp() {
  const { message } = AntApp.useApp();
  const { locale, setLocale, messages, templateText, diagnosticMessages } = useI18n();
  const screens = useBreakpoint();
  const isCompact = !screens.md;
  const [source, setSource] = useLocalStorage("mermaid-edit:source", initialDiagram);
  const [settings, setSettings] = useJsonLocalStorage<DiagramSettings>(
    "mermaid-edit:settings",
    defaultDiagramSettings,
  );
  const [scale, setScale] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [filename, setFilename] = useState("mermaid-diagram");
  const [selectedType, setSelectedType] = useState(chartTypes[0]);
  const [search, setSearch] = useState("");
  const [markdownImportOpen, setMarkdownImportOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const rendererLocale = useMemo(
    () => ({
      diagnostics: diagnosticMessages,
      render: messages.render,
    }),
    [diagnosticMessages, messages.render],
  );
  const { svg, state } = useMermaidRenderer(source, settings, rendererLocale);
  const canExport = state.status === "ready" && Boolean(svg);
  const statusMessage = state.status === "error" && state.diagnostic ? state.diagnostic.summary : state.message;
  const localizedTemplates = useMemo(
    () =>
      diagramTemplates.map((template) => ({
        ...template,
        text: templateText(template.id, template),
      })),
    [templateText],
  );
  const chartTypeLabels = useMemo(() => {
    const labels = new Map<string, string>();
    localizedTemplates.forEach((template) => {
      labels.set(template.type, template.text.type);
    });
    return labels;
  }, [localizedTemplates]);

  const filteredTemplates = useMemo(
    () =>
      localizedTemplates.filter((template) => {
        const matchesType = template.type === selectedType;
        const keyword = search.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          template.text.title.toLowerCase().includes(keyword) ||
          template.text.tags.some((tag) => tag.toLowerCase().includes(keyword));

        return matchesType && matchesSearch;
      }),
    [localizedTemplates, search, selectedType],
  );

  const activeTemplate = localizedTemplates.find((template) => template.source === source);

  const handleExport = async (format: ExportFormat) => {
    if (!svg) {
      return;
    }

    try {
      if (format === "svg") {
        downloadSvg(svg, `${filename || "diagram"}.svg`);
      } else {
        await downloadRaster(svg, format, scale, {
          filename,
          background: settings.background,
        });
      }
      message.success(messages.feedback.exported(format.toUpperCase()));
    } catch (error) {
      message.error(error instanceof Error ? error.message : messages.feedback.exportFailed);
    }
  };

  const handleExportMarkdown = () => {
    downloadMarkdown(
      formatMermaidMarkdown(source),
      `${filename.trim() || "mermaid-diagram"}.md`,
    );
    message.success(messages.feedback.markdownExported);
  };

  const handleCopySvg = async () => {
    if (!svg) {
      return;
    }

    try {
      await copySvg(svg);
      message.success(messages.feedback.svgCopied);
    } catch {
      message.error(messages.feedback.copyFailed);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = diagramTemplates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    setSource(template.source);
    setSelectedType(template.type);
    message.success(messages.feedback.templateLoaded(templateText(template.id, template).title));
  };

  const exportItems: MenuProps["items"] = [
    {
      key: "svg",
      label: messages.header.exportSvg,
      icon: <FileTextOutlined />,
      disabled: !canExport,
      onClick: () => void handleExport("svg"),
    },
    {
      key: "png",
      label: messages.header.exportPng,
      icon: <FileImageOutlined />,
      disabled: !canExport,
      onClick: () => void handleExport("png"),
    },
    {
      key: "jpg",
      label: messages.header.exportJpg,
      icon: <PictureOutlined />,
      disabled: !canExport,
      onClick: () => void handleExport("jpg"),
    },
    {
      key: "markdown",
      label: messages.header.exportMarkdown,
      icon: <FileTextOutlined />,
      disabled: !source.trim(),
      onClick: handleExportMarkdown,
    },
  ];

  const updateSettings = <Key extends keyof DiagramSettings>(
    key: Key,
    value: DiagramSettings[Key],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <Layout className="appShell">
      <Sider className="templateSider" width={268} theme="light" breakpoint="lg" collapsedWidth={0}>
        <div className="siderHeader">
          <Title level={4}>{messages.sider.libraryTitle}</Title>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={messages.sider.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Text className="siderSectionTitle" type="secondary">
          {messages.sider.chartTypes}
        </Text>
        <div className="templateTypeGrid" role="group" aria-label={messages.sider.chartTypes}>
          {chartTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`templateTypeButton${type === selectedType ? " templateTypeButtonActive" : ""}`}
              aria-pressed={type === selectedType}
              onClick={() => setSelectedType(type)}
            >
              {chartTypeLabels.get(type) ?? type}
            </button>
          ))}
        </div>

        <Text className="siderSectionTitle" type="secondary">
          {messages.sider.templateList}
        </Text>
        <List
          className="templateList"
          dataSource={filteredTemplates}
          locale={{ emptyText: messages.sider.emptyTemplates }}
          renderItem={(item) => (
            <List.Item
              className="templateItem"
              onClick={() => handleTemplateSelect(item.id)}
            >
              <div className="templateThumb">
                <PictureOutlined />
              </div>
              <div className="templateMeta">
                <Text strong>{item.text.title}</Text>
                <Space size={[4, 4]} wrap>
                  {item.text.tags.map((tag, index) => (
                    <Tag key={tag} color={index === 0 ? "green" : "blue"}>
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </div>
            </List.Item>
          )}
        />

        <Button
          className="manageTemplateButton"
          icon={<SettingOutlined />}
          block
          onClick={() => setTemplateManagerOpen(true)}
        >
          {messages.sider.manageTemplates}
        </Button>
      </Sider>

      <Layout>
        <Header className="appHeader">
          <Space align="center" size={12}>
            <img className="brandMark" src="/favicon.svg" alt="" aria-hidden="true" />
            <Title level={3}>{messages.app.title}</Title>
            <Tag color="cyan">{messages.app.localTag}</Tag>
            <Badge status={canExport ? "success" : state.status === "error" ? "error" : "processing"} />
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
            <Button icon={<CopyOutlined />} disabled={!canExport} onClick={handleCopySvg}>
              {messages.header.copySvg}
            </Button>
            <Dropdown menu={{ items: exportItems }} trigger={["click"]}>
              <Button type="primary" icon={<DownloadOutlined />} disabled={!canExport}>
                {messages.common.export}
              </Button>
            </Dropdown>
            <Tooltip title={messages.header.resetTemplateTooltip}>
              <Button icon={<ReloadOutlined />} onClick={() => handleTemplateSelect("flow-basic")} />
            </Tooltip>
            <Button icon={<MenuOutlined />} />
          </Space>
        </Header>

        <Content className="contentShell">
          <div className="templateNotice">
            <Badge status="success" />
            <div>
              <Text strong>
                {activeTemplate
                  ? messages.app.loadedTemplate(activeTemplate.text.title)
                  : messages.app.customDiagram}
              </Text>
              <Text type="secondary">
                {activeTemplate
                  ? messages.app.loadedTemplateDescription
                  : messages.app.customDiagramDescription}
              </Text>
            </div>
          </div>

          <div className="workspace">
            {isCompact ? (
              <div className="mobileWorkspace">
                <EditorPane
                  value={source}
                  renderState={state}
                  onChange={setSource}
                  onOpenMarkdownImport={() => setMarkdownImportOpen(true)}
                />
                <PreviewPane
                  svg={svg}
                  state={state}
                  zoom={zoom}
                  scale={scale}
                  filename={filename}
                  background={settings.background}
                />
              </div>
            ) : (
              <Splitter className="editorSplitter">
                <Splitter.Panel defaultSize="42%" min="360px">
                <EditorPane
                  value={source}
                  renderState={state}
                  onChange={setSource}
                  onOpenMarkdownImport={() => setMarkdownImportOpen(true)}
                />
                </Splitter.Panel>
                <Splitter.Panel min="420px">
                  <PreviewPane
                    svg={svg}
                    state={state}
                    zoom={zoom}
                    scale={scale}
                    filename={filename}
                    background={settings.background}
                  />
                </Splitter.Panel>
              </Splitter>
            )}

            <SettingsPanel
              settings={settings}
              scale={scale}
              filename={filename}
              zoom={zoom}
              source={source}
              onSettingsChange={updateSettings}
              onScaleChange={setScale}
              onFilenameChange={setFilename}
              onZoomChange={setZoom}
              onResetZoom={() => setZoom(100)}
            />
          </div>
        </Content>

        <StatusBar renderState={state} sourceLength={source.length} zoom={zoom} />
      </Layout>
      <MarkdownImportModal
        open={markdownImportOpen}
        onClose={() => setMarkdownImportOpen(false)}
        onImport={(nextSource) => {
          setSource(nextSource);
          message.success(messages.feedback.markdownImported);
        }}
      />
      <TemplateManagerModal
        open={templateManagerOpen}
        templates={diagramTemplates}
        chartTypes={chartTypes}
        activeTemplateId={activeTemplate?.id}
        onClose={() => setTemplateManagerOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </Layout>
  );
}

function isLocaleCode(value: string): value is LocaleCode {
  return localeOptions.some((option) => option.value === value);
}

function detectBrowserLocale(): LocaleCode {
  const browserLanguages = navigator.languages.length > 0 ? navigator.languages : [navigator.language];

  for (const language of browserLanguages) {
    const normalized = language.toLowerCase();
    const alias = localeAliases[normalized];
    if (alias) {
      return alias;
    }

    if (isLocaleCode(normalized)) {
      return normalized;
    }

    const baseLanguage = normalized.split("-")[0];
    if (isLocaleCode(baseLanguage)) {
      return baseLanguage;
    }
  }

  return "zh-CN";
}

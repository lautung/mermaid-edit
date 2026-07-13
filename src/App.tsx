import { useMemo, useState } from "react";
import {
  App as AntApp,
  Badge,
  ConfigProvider,
  Grid,
  Layout,
  Splitter,
  Typography,
  theme as antTheme,
} from "antd";
import { EditorPane } from "./components/EditorPane";
import { HeaderActions } from "./components/HeaderActions";
import { MarkdownImportModal } from "./components/MarkdownImportModal";
import { PreviewPane } from "./components/PreviewPane";
import { SettingsPanel } from "./components/SettingsPanel";
import { StatusBar } from "./components/StatusBar";
import { TemplateSidebar } from "./components/TemplateSidebar";
import { TemplateManagerModal } from "./components/TemplateManagerModal";
import { diagramTemplates, initialDiagram } from "./data/examples";
import { defaultDiagramSettings, normalizeDiagramSettings } from "./data/settings";
import { useExportActions } from "./hooks/useExportActions";
import { useEditorSearchParams } from "./hooks/useEditorSearchParams";
import { useJsonLocalStorage } from "./hooks/useJsonLocalStorage";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useMermaidRenderer } from "./hooks/useMermaidRenderer";
import { antdLocales } from "./i18n/antdLocales";
import { I18nProvider } from "./i18n/I18nProvider";
import { localeOptions } from "./i18n/messages";
import type { LocaleCode } from "./i18n/types";
import { useI18n } from "./i18n/useI18n";
import type { DiagramSettings } from "./types";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
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
  const { messages, templateText, diagnosticMessages } = useI18n();
  const screens = useBreakpoint();
  const isCompact = !screens.md;
  const [source, setSource] = useLocalStorage("mermaid-edit:source", initialDiagram);
  const [settings, setSettings] = useJsonLocalStorage<DiagramSettings>(
    "mermaid-edit:settings",
    defaultDiagramSettings,
    normalizeDiagramSettings,
  );
  const [markdownImportOpen, setMarkdownImportOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const {
    selectedType,
    search,
    activePreviewTab,
    zoom,
    scale,
    filename,
    setSelectedType,
    setSearch,
    setActivePreviewTab,
    setZoom,
    setScale,
    setFilename,
  } = useEditorSearchParams({ chartTypes });
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
  const activeTemplate = localizedTemplates.find((template) => template.source === source);
  const { handleCopySvg, handleExport, handleExportMarkdown } = useExportActions({
    svg,
    source,
    filename,
    scale,
    background: settings.background,
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = diagramTemplates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    setSource(template.source);
    setSelectedType(template.type);
    message.success(messages.feedback.templateLoaded(templateText(template.id, template).title));
  };

  const updateSettings = <Key extends keyof DiagramSettings>(
    key: Key,
    value: DiagramSettings[Key],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <Layout className="appShell">
      <Sider className="templateSider" width={268} theme="light" breakpoint="lg" collapsedWidth={0}>
        <TemplateSidebar
          chartTypes={chartTypes}
          selectedType={selectedType}
          search={search}
          templates={localizedTemplates}
          onManageTemplates={() => setTemplateManagerOpen(true)}
          onSearchChange={setSearch}
          onSelectTemplate={handleTemplateSelect}
          onSelectedTypeChange={setSelectedType}
        />
      </Sider>

      <Layout>
        <Header className="appHeader">
          <HeaderActions
            canExport={canExport}
            source={source}
            statusMessage={statusMessage}
            renderState={state}
            onCopySvg={handleCopySvg}
            onExport={(format) => void handleExport(format)}
            onExportMarkdown={handleExportMarkdown}
            onResetTemplate={() => handleTemplateSelect("flow-basic")}
          />
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
                  activeTab={activePreviewTab}
                  onActiveTabChange={setActivePreviewTab}
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
                    activeTab={activePreviewTab}
                    onActiveTabChange={setActivePreviewTab}
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

export default App;

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

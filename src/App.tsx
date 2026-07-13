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
import type { DiagramSettings, ExportFormat } from "./types";
import { copySvg, downloadMarkdown, downloadRaster, downloadSvg } from "./utils/exportDiagram";
import { formatMermaidMarkdown } from "./utils/markdownMermaid";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const chartTypes = Array.from(new Set(diagramTemplates.map((template) => template.type)));
export function App() {
  return (
    <ConfigProvider
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
  );
}

function MermaidEditorApp() {
  const { message } = AntApp.useApp();
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
  const { svg, state } = useMermaidRenderer(source, settings);
  const canExport = state.status === "ready" && Boolean(svg);
  const statusMessage = state.status === "error" && state.diagnostic ? state.diagnostic.summary : state.message;

  const filteredTemplates = useMemo(
    () =>
      diagramTemplates.filter((template) => {
        const matchesType = template.type === selectedType;
        const keyword = search.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          template.title.toLowerCase().includes(keyword) ||
          template.tags.some((tag) => tag.toLowerCase().includes(keyword));

        return matchesType && matchesSearch;
      }),
    [search, selectedType],
  );

  const activeTemplate = diagramTemplates.find((template) => template.source === source);

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
      message.success(`已导出 ${format.toUpperCase()}`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "导出失败");
    }
  };

  const handleExportMarkdown = () => {
    downloadMarkdown(
      formatMermaidMarkdown(source),
      `${filename.trim() || "mermaid-diagram"}.md`,
    );
    message.success("Markdown 已导出");
  };

  const handleCopySvg = async () => {
    if (!svg) {
      return;
    }

    try {
      await copySvg(svg);
      message.success("SVG 已复制到剪贴板");
    } catch {
      message.error("复制失败，请改用导出 SVG");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = diagramTemplates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    setSource(template.source);
    setSelectedType(template.type);
    message.success(`${template.title} 已载入`);
  };

  const exportItems: MenuProps["items"] = [
    {
      key: "svg",
      label: "导出为 SVG",
      icon: <FileTextOutlined />,
      disabled: !canExport,
      onClick: () => void handleExport("svg"),
    },
    {
      key: "png",
      label: "导出为 PNG",
      icon: <FileImageOutlined />,
      disabled: !canExport,
      onClick: () => void handleExport("png"),
    },
    {
      key: "jpg",
      label: "导出为 JPG",
      icon: <PictureOutlined />,
      disabled: !canExport,
      onClick: () => void handleExport("jpg"),
    },
    {
      key: "markdown",
      label: "导出为 Markdown",
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
          <Title level={4}>模板库</Title>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索模板"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Text className="siderSectionTitle" type="secondary">
          图表类型
        </Text>
        <div className="templateTypeGrid" role="group" aria-label="图表类型">
          {chartTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`templateTypeButton${type === selectedType ? " templateTypeButtonActive" : ""}`}
              aria-pressed={type === selectedType}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <Text className="siderSectionTitle" type="secondary">
          模板列表
        </Text>
        <List
          className="templateList"
          dataSource={filteredTemplates}
          locale={{ emptyText: "没有匹配的模板" }}
          renderItem={(item) => (
            <List.Item
              className="templateItem"
              onClick={() => handleTemplateSelect(item.id)}
            >
              <div className="templateThumb">
                <PictureOutlined />
              </div>
              <div className="templateMeta">
                <Text strong>{item.title}</Text>
                <Space size={[4, 4]} wrap>
                  {item.tags.map((tag) => (
                    <Tag key={tag} color={tag === "常用" ? "green" : "blue"}>
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
          管理模板
        </Button>
      </Sider>

      <Layout>
        <Header className="appHeader">
          <Space align="center" size={12}>
            <div className="brandMark">M</div>
            <Title level={3}>Mermaid 在线编辑器</Title>
            <Tag color="cyan">浏览器本地处理</Tag>
            <Badge status={canExport ? "success" : state.status === "error" ? "error" : "processing"} />
            <Text type="secondary">{canExport ? "已保存" : statusMessage}</Text>
          </Space>

          <Space className="headerActions">
            <Button icon={<CopyOutlined />} disabled={!canExport} onClick={handleCopySvg}>
              复制 SVG
            </Button>
            <Dropdown menu={{ items: exportItems }} trigger={["click"]}>
              <Button type="primary" icon={<DownloadOutlined />} disabled={!canExport}>
                导出
              </Button>
            </Dropdown>
            <Tooltip title="恢复默认模板">
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
                {activeTemplate ? `${activeTemplate.title} 已载入` : "正在编辑自定义图表"}
              </Text>
              <Text type="secondary">
                {activeTemplate
                  ? "已为您加载基础模板，您可以在左侧模板库中切换其他模板。"
                  : "当前内容来自本地保存，选择左侧模板可快速替换。"}
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
          message.success("Mermaid 代码已从 Markdown 载入");
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

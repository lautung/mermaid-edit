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
  Menu,
  Select,
  Slider,
  Space,
  Splitter,
  Switch,
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
import { PreviewPane } from "./components/PreviewPane";
import { StatusBar } from "./components/StatusBar";
import { diagramTemplates, initialDiagram } from "./data/examples";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useMermaidRenderer } from "./hooks/useMermaidRenderer";
import type { ExportFormat, MermaidTheme } from "./types";
import { copySvg, downloadRaster, downloadSvg } from "./utils/exportDiagram";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const chartTypes = Array.from(new Set(diagramTemplates.map((template) => template.type)));
const themes: MermaidTheme[] = ["default", "base", "neutral", "forest", "dark"];

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
  const [theme, setTheme] = useState<MermaidTheme>("base");
  const [scale, setScale] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [transparentBackground, setTransparentBackground] = useState(true);
  const [filename, setFilename] = useState("mermaid-diagram");
  const [selectedType, setSelectedType] = useState(chartTypes[0]);
  const [search, setSearch] = useState("");
  const { svg, state } = useMermaidRenderer(source, theme);
  const canExport = state.status === "ready" && Boolean(svg);

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
          transparentBackground,
        });
      }
      message.success(`已导出 ${format.toUpperCase()}`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "导出失败");
    }
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
  ];

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
        <Menu
          className="templateMenu"
          mode="inline"
          selectedKeys={[selectedType]}
          items={chartTypes.map((type) => ({
            key: type,
            label: type,
          }))}
          onClick={({ key }) => setSelectedType(String(key))}
        />

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

        <Button className="manageTemplateButton" icon={<SettingOutlined />} block>
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
            <Text type="secondary">{canExport ? "已保存" : state.message}</Text>
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
                <EditorPane value={source} renderState={state} onChange={setSource} />
                <PreviewPane
                  svg={svg}
                  state={state}
                  zoom={zoom}
                  scale={scale}
                  filename={filename}
                />
              </div>
            ) : (
              <Splitter className="editorSplitter">
                <Splitter.Panel defaultSize="42%" min="360px">
                  <EditorPane value={source} renderState={state} onChange={setSource} />
                </Splitter.Panel>
                <Splitter.Panel min="420px">
                  <PreviewPane
                    svg={svg}
                    state={state}
                    zoom={zoom}
                    scale={scale}
                    filename={filename}
                  />
                </Splitter.Panel>
              </Splitter>
            )}

            <aside className="settingsPanel" aria-label="图表设置">
              <div className="settingsHeader">
                <Title level={5}>图表设置</Title>
                <SettingOutlined />
              </div>

              <Space direction="vertical" size={18} className="settingsFields">
                <label>
                  <Text type="secondary">主题</Text>
                  <Select
                    value={theme}
                    options={themes.map((item) => ({ label: item, value: item }))}
                    onChange={setTheme}
                  />
                </label>

                <label>
                  <Text type="secondary">导出比例</Text>
                  <Select
                    value={scale}
                    options={[1, 2, 3, 4].map((item) => ({
                      label: `${item}x`,
                      value: item,
                    }))}
                    onChange={setScale}
                  />
                </label>

                <div className="switchRow">
                  <Text type="secondary">透明背景（PNG）</Text>
                  <Switch checked={transparentBackground} onChange={setTransparentBackground} />
                </div>

                <label>
                  <Text type="secondary">文件名</Text>
                  <Input value={filename} onChange={(event) => setFilename(event.target.value)} />
                </label>

                <div>
                  <Text type="secondary">预览缩放</Text>
                  <div className="zoomStepper">
                    <Button onClick={() => setZoom((value) => Math.max(50, value - 10))}>-</Button>
                    <Text>{zoom}%</Text>
                    <Button onClick={() => setZoom((value) => Math.min(200, value + 10))}>+</Button>
                  </div>
                  <Slider min={50} max={200} step={10} value={zoom} onChange={setZoom} />
                  <div className="zoomRange">
                    <Text type="secondary">50%</Text>
                    <Text type="secondary">100%</Text>
                    <Text type="secondary">200%</Text>
                  </div>
                </div>

                <Button icon={<ReloadOutlined />} onClick={() => setZoom(100)} block>
                  重置视图
                </Button>
              </Space>
            </aside>
          </div>
        </Content>

        <StatusBar renderState={state} sourceLength={source.length} zoom={zoom} />
      </Layout>
    </Layout>
  );
}

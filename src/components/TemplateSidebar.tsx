import { useMemo } from "react";
import { PictureOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Space, Tag, Typography } from "antd";
import type { DiagramTemplate } from "../data/examples";
import { ALL_TEMPLATE_TYPE } from "../data/templateFilters";
import type { TemplateText } from "../i18n/types";
import { useI18n } from "../i18n/useI18n";

const { Text, Title } = Typography;

export type LocalizedDiagramTemplate = DiagramTemplate & {
  text: TemplateText;
};

type TemplateSidebarProps = {
  chartTypes: string[];
  selectedType: string;
  search: string;
  templates: LocalizedDiagramTemplate[];
  onManageTemplates: () => void;
  onSearchChange: (search: string) => void;
  onSelectTemplate: (templateId: string) => void;
  onSelectedTypeChange: (type: string) => void;
};

export function TemplateSidebar({
  chartTypes,
  selectedType,
  search,
  templates,
  onManageTemplates,
  onSearchChange,
  onSelectTemplate,
  onSelectedTypeChange,
}: TemplateSidebarProps) {
  const { messages } = useI18n();
  const chartTypeLabels = useMemo(() => {
    const labels = new Map<string, string>();
    templates.forEach((template) => {
      labels.set(template.typeKey, template.text.type);
    });
    return labels;
  }, [templates]);
  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        const matchesType = selectedType === ALL_TEMPLATE_TYPE || template.typeKey === selectedType;
        const keyword = search.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          template.text.title.toLowerCase().includes(keyword) ||
          template.text.tags.some((tag) => tag.toLowerCase().includes(keyword));

        return matchesType && matchesSearch;
      }),
    [search, selectedType, templates],
  );

  return (
    <>
      <div className="siderHeader">
        <Title level={4}>{messages.sider.libraryTitle}</Title>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={messages.sider.searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Text className="siderSectionTitle" type="secondary">
        {messages.sider.chartTypes}
      </Text>
      <div className="templateTypeGrid" role="group" aria-label={messages.sider.chartTypes}>
        <button
          type="button"
          className={`templateTypeButton${selectedType === ALL_TEMPLATE_TYPE ? " templateTypeButtonActive" : ""}`}
          aria-pressed={selectedType === ALL_TEMPLATE_TYPE}
          onClick={() => onSelectedTypeChange(ALL_TEMPLATE_TYPE)}
        >
          {messages.sider.allTemplates}
        </button>
        {chartTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={`templateTypeButton${type === selectedType ? " templateTypeButtonActive" : ""}`}
            aria-pressed={type === selectedType}
            onClick={() => onSelectedTypeChange(type)}
          >
            {chartTypeLabels.get(type) ?? type}
          </button>
        ))}
      </div>

      <Text className="siderSectionTitle" type="secondary">
        {messages.sider.templateList}
      </Text>
      <div className="templateList" role="list">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((item) => (
            <button
              key={item.id}
              type="button"
              className="templateItem"
              onClick={() => onSelectTemplate(item.id)}
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
            </button>
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={messages.sider.emptyTemplates} />
        )}
      </div>

      <Button
        className="manageTemplateButton"
        icon={<SettingOutlined />}
        block
        onClick={onManageTemplates}
      >
        {messages.sider.manageTemplates}
      </Button>
    </>
  );
}

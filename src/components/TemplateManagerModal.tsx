import { Button, Input, Modal, Select, Space, Tag, Typography } from "antd";
import { PictureOutlined, SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import type { DiagramTemplate } from "../data/examples";
import { useI18n } from "../i18n/useI18n";

type TemplateManagerModalProps = {
  open: boolean;
  templates: DiagramTemplate[];
  chartTypes: string[];
  activeTemplateId?: string;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
};

export function TemplateManagerModal({
  open,
  templates,
  chartTypes,
  activeTemplateId,
  onClose,
  onSelectTemplate,
}: TemplateManagerModalProps) {
  const { messages, templateText } = useI18n();
  const [selectedType, setSelectedType] = useState<string>("");
  const [search, setSearch] = useState("");

  const localizedTemplates = useMemo(
    () =>
      templates.map((template) => ({
        ...template,
        text: templateText(template.id, template),
      })),
    [templateText, templates],
  );

  const chartTypeOptions = useMemo(() => {
    const labels = new Map<string, string>();
    localizedTemplates.forEach((template) => {
      labels.set(template.type, template.text.type);
    });

    return [
      { label: messages.templateManager.allTypes, value: "" },
      ...chartTypes.map((type) => ({ label: labels.get(type) ?? type, value: type })),
    ];
  }, [chartTypes, localizedTemplates, messages.templateManager.allTypes]);

  const filteredTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return localizedTemplates.filter((template) => {
      const matchesType = !selectedType || template.type === selectedType;
      const matchesSearch =
        !keyword ||
        template.text.title.toLowerCase().includes(keyword) ||
        template.text.type.toLowerCase().includes(keyword) ||
        template.text.tags.some((tag) => tag.toLowerCase().includes(keyword));

      return matchesType && matchesSearch;
    });
  }, [localizedTemplates, search, selectedType]);

  const handleSelect = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={messages.templateManager.title}
      footer={null}
      onCancel={onClose}
      destroyOnHidden
      width={720}
    >
      <Space orientation="vertical" size={14} className="templateManager">
        <div className="templateManagerToolbar">
          <Input
            allowClear
            aria-label={messages.templateManager.searchAriaLabel}
            prefix={<SearchOutlined />}
            placeholder={messages.templateManager.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            aria-label={messages.templateManager.filterTypeAriaLabel}
            value={selectedType}
            options={chartTypeOptions}
            onChange={setSelectedType}
          />
        </div>

        <div className="templateManagerList" role="list" aria-label={messages.templateManager.listAriaLabel}>
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((item) => (
              <div key={item.id} role="listitem" className="templateManagerItem">
                <div className="templateManagerThumb">
                  <PictureOutlined />
                </div>
                <div className="templateManagerMeta">
                  <Space size={8} wrap>
                    <Typography.Text strong>{item.text.title}</Typography.Text>
                    <Tag color="cyan">{item.text.type}</Tag>
                  </Space>
                  <Space size={[4, 4]} wrap>
                    {item.text.tags.map((tag) => (
                      <Tag key={tag} color={tag === messages.templateManager.commonTag ? "green" : "blue"}>
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
                <Button
                  type={item.id === activeTemplateId ? "default" : "primary"}
                  onClick={() => handleSelect(item.id)}
                >
                  {item.id === activeTemplateId
                    ? messages.templateManager.currentTemplate
                    : messages.templateManager.loadTemplate}
                </Button>
              </div>
            ))
          ) : (
            <Typography.Text type="secondary">{messages.templateManager.emptyTemplates}</Typography.Text>
          )}
        </div>
      </Space>
    </Modal>
  );
}

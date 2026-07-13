import { Button, Input, Modal, Select, Space, Tag, Typography } from "antd";
import { PictureOutlined, SearchOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import type { DiagramTemplate } from "../data/examples";

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
  const [selectedType, setSelectedType] = useState<string>("全部");
  const [search, setSearch] = useState("");

  const filteredTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesType = selectedType === "全部" || template.type === selectedType;
      const matchesSearch =
        !keyword ||
        template.title.toLowerCase().includes(keyword) ||
        template.type.toLowerCase().includes(keyword) ||
        template.tags.some((tag) => tag.toLowerCase().includes(keyword));

      return matchesType && matchesSearch;
    });
  }, [search, selectedType, templates]);

  const handleSelect = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="管理模板"
      footer={null}
      onCancel={onClose}
      destroyOnHidden
      width={720}
    >
      <Space orientation="vertical" size={14} className="templateManager">
        <div className="templateManagerToolbar">
          <Input
            allowClear
            aria-label="搜索模板"
            prefix={<SearchOutlined />}
            placeholder="搜索标题、类型或标签"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            aria-label="筛选图表类型"
            value={selectedType}
            options={["全部", ...chartTypes].map((type) => ({ label: type, value: type }))}
            onChange={setSelectedType}
          />
        </div>

        <div className="templateManagerList" role="list" aria-label="模板管理列表">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((item) => (
              <div key={item.id} role="listitem" className="templateManagerItem">
                <div className="templateManagerThumb">
                  <PictureOutlined />
                </div>
                <div className="templateManagerMeta">
                  <Space size={8} wrap>
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <Tag color="cyan">{item.type}</Tag>
                  </Space>
                  <Space size={[4, 4]} wrap>
                    {item.tags.map((tag) => (
                      <Tag key={tag} color={tag === "常用" ? "green" : "blue"}>
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                </div>
                <Button
                  type={item.id === activeTemplateId ? "default" : "primary"}
                  onClick={() => handleSelect(item.id)}
                >
                  {item.id === activeTemplateId ? "当前模板" : "载入"}
                </Button>
              </div>
            ))
          ) : (
            <Typography.Text type="secondary">没有匹配的模板</Typography.Text>
          )}
        </div>
      </Space>
    </Modal>
  );
}

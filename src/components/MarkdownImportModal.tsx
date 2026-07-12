import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Alert, Input, Modal, Select, Space, Typography } from "antd";
import { extractMermaidBlocks } from "../utils/markdownMermaid";

type MarkdownImportModalProps = {
  open: boolean;
  onClose: () => void;
  onImport: (source: string) => void;
};

export function MarkdownImportModal({ open, onClose, onImport }: MarkdownImportModalProps) {
  const [markdown, setMarkdown] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState("");
  const blocks = useMemo(() => extractMermaidBlocks(markdown), [markdown]);

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);
    setError("");
    setSelectedIndex(0);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      handleMarkdownChange(await file.text());
    } catch {
      setError("无法读取该 Markdown 文件");
    } finally {
      event.target.value = "";
    }
  };

  const handleImport = () => {
    if (blocks.length === 0) {
      setError("没有找到可导入的 Mermaid 代码块");
      return;
    }

    onImport(blocks[selectedIndex].source);
    setMarkdown("");
    setSelectedIndex(0);
    setError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      title="导入 Markdown 中的 Mermaid"
      okText="载入代码"
      cancelText="取消"
      onCancel={onClose}
      onOk={handleImport}
      okButtonProps={{ disabled: blocks.length === 0 }}
      destroyOnHidden
    >
      <Space direction="vertical" size={14} className="markdownImportForm">
        <Typography.Text type="secondary">
          粘贴 Markdown 文本，或选择本地 .md 文件。代码只在浏览器中处理。
        </Typography.Text>
        <label className="markdownFileInput">
          <span>选择 Markdown 文件</span>
          <input type="file" accept=".md,text/markdown" onChange={handleFileChange} />
        </label>
        <Input.TextArea
          rows={10}
          value={markdown}
          placeholder="```mermaid\nflowchart LR\n  A --> B\n```"
          onChange={(event) => handleMarkdownChange(event.target.value)}
        />
        {blocks.length > 1 ? (
          <Select
            aria-label="选择 Mermaid 代码块"
            value={selectedIndex}
            options={blocks.map((block) => ({
              label: `第 ${block.index} 个代码块`,
              value: block.index - 1,
            }))}
            onChange={setSelectedIndex}
          />
        ) : null}
        {blocks.length > 0 ? (
          <Typography.Text type="success">找到 {blocks.length} 个 Mermaid 代码块</Typography.Text>
        ) : null}
        {error ? <Alert showIcon type="error" message={error} /> : null}
      </Space>
    </Modal>
  );
}

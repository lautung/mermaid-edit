import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Alert, Input, Modal, Select, Space, Typography } from "antd";
import { useI18n } from "../i18n/useI18n";
import { extractMermaidBlocks } from "../utils/markdownMermaid";

type MarkdownImportModalProps = {
  open: boolean;
  onClose: () => void;
  onImport: (source: string) => void;
};

export function MarkdownImportModal({ open, onClose, onImport }: MarkdownImportModalProps) {
  const { messages } = useI18n();
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
      setError(messages.markdownImport.readError);
    } finally {
      event.target.value = "";
    }
  };

  const handleImport = () => {
    if (blocks.length === 0) {
      setError(messages.markdownImport.noBlocks);
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
      title={messages.markdownImport.title}
      okText={messages.markdownImport.okText}
      cancelText={messages.common.cancel}
      onCancel={onClose}
      onOk={handleImport}
      okButtonProps={{ disabled: blocks.length === 0 }}
      destroyOnHidden
    >
      <Space direction="vertical" size={14} className="markdownImportForm">
        <Typography.Text type="secondary">
          {messages.markdownImport.description}
        </Typography.Text>
        <label className="markdownFileInput">
          <span>{messages.markdownImport.chooseFile}</span>
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
            aria-label={messages.markdownImport.selectBlockAriaLabel}
            value={selectedIndex}
            options={blocks.map((block) => ({
              label: messages.markdownImport.blockLabel(block.index),
              value: block.index - 1,
            }))}
            onChange={setSelectedIndex}
          />
        ) : null}
        {blocks.length > 0 ? (
          <Typography.Text type="success">{messages.markdownImport.blocksFound(blocks.length)}</Typography.Text>
        ) : null}
        {error ? <Alert showIcon type="error" message={error} /> : null}
      </Space>
    </Modal>
  );
}

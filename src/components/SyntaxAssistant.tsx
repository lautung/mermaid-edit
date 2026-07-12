import { Alert, Button, Space, Tag, Typography } from "antd";
import { CopyOutlined, EnvironmentOutlined, InsertRowBelowOutlined } from "@ant-design/icons";
import type { SyntaxDiagnostic } from "../diagnostics/types";

type SyntaxAssistantProps = {
  diagnostic: SyntaxDiagnostic;
  onFocusLine: (line: number) => void;
  onInsertAtCursor: (snippet: string) => void;
  onInsertAfterLine: (line: number, snippet: string) => void;
  onCopyRawMessage: (message: string) => void;
};

export function SyntaxAssistant({
  diagnostic,
  onFocusLine,
  onInsertAtCursor,
  onInsertAfterLine,
  onCopyRawMessage,
}: SyntaxAssistantProps) {
  const canInsert = Boolean(diagnostic.rule);
  const canInsertAfterLine = canInsert && diagnostic.line !== undefined;

  return (
    <section className="syntaxAssistant" aria-label="Mermaid 语法修复助手">
      <Alert
        showIcon
        type="error"
        title={diagnostic.summary}
        description={diagnostic.manualFixHint}
      />
      <Space className="syntaxAssistantMeta" size={[8, 8]} wrap>
        {diagnostic.line !== undefined ? <Tag color="red">第 {diagnostic.line} 行</Tag> : null}
        {diagnostic.line !== undefined ? (
          <Button
            aria-label="定位错误"
            icon={<EnvironmentOutlined />}
            onClick={() => onFocusLine(diagnostic.line!)}
          >
            定位错误
          </Button>
        ) : null}
        {diagnostic.rule ? <Typography.Text code>{diagnostic.rule.title}</Typography.Text> : null}
      </Space>
      {diagnostic.rule ? (
        <div className="syntaxAssistantSnippet">
          <Typography.Text type="secondary">安全参照片段</Typography.Text>
          <Typography.Paragraph code copyable={{ text: diagnostic.rule.snippet }}>
            {diagnostic.rule.snippet}
          </Typography.Paragraph>
          <Space size={[8, 8]} wrap>
            <Button
              aria-label="插入到错误行后"
              icon={<InsertRowBelowOutlined />}
              disabled={!canInsertAfterLine}
              onClick={() => onInsertAfterLine(diagnostic.line!, diagnostic.rule!.snippet)}
            >
              插入到错误行后
            </Button>
            <Button
              aria-label="插入到光标处"
              disabled={!canInsert}
              onClick={() => onInsertAtCursor(diagnostic.rule!.snippet)}
            >
              插入到光标处
            </Button>
          </Space>
        </div>
      ) : null}
      <details className="syntaxAssistantDetails">
        <summary>技术详情</summary>
        <Typography.Paragraph code>{diagnostic.rawMessage}</Typography.Paragraph>
        <Button
          aria-label="复制技术详情"
          icon={<CopyOutlined />}
          onClick={() => onCopyRawMessage(diagnostic.rawMessage)}
        >
          复制技术详情
        </Button>
      </details>
    </section>
  );
}

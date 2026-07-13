import { Alert, Button, Space, Tag, Typography } from "antd";
import { CopyOutlined, EnvironmentOutlined, InsertRowBelowOutlined } from "@ant-design/icons";
import type { SyntaxDiagnostic } from "../diagnostics/types";
import { useI18n } from "../i18n/useI18n";

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
  const { messages } = useI18n();
  const canInsert = Boolean(diagnostic.rule);
  const canInsertAfterLine = canInsert && diagnostic.line !== undefined;

  return (
    <section className="syntaxAssistant" aria-label={messages.syntaxAssistant.ariaLabel}>
      <Alert
        showIcon
        type="error"
        title={diagnostic.summary}
        description={diagnostic.manualFixHint}
      />
      <Space className="syntaxAssistantMeta" size={[8, 8]} wrap>
        {diagnostic.line !== undefined ? <Tag color="red">{messages.syntaxAssistant.lineTag(diagnostic.line)}</Tag> : null}
        {diagnostic.line !== undefined ? (
          <Button
            aria-label={messages.syntaxAssistant.focusError}
            icon={<EnvironmentOutlined />}
            onClick={() => onFocusLine(diagnostic.line!)}
          >
            {messages.syntaxAssistant.focusError}
          </Button>
        ) : null}
        {diagnostic.rule ? <Typography.Text code>{diagnostic.rule.title}</Typography.Text> : null}
      </Space>
      {diagnostic.rule ? (
        <div className="syntaxAssistantSnippet">
          <Typography.Text type="secondary">{messages.syntaxAssistant.safeSnippet}</Typography.Text>
          <Typography.Paragraph code copyable={{ text: diagnostic.rule.snippet }}>
            {diagnostic.rule.snippet}
          </Typography.Paragraph>
          <Space size={[8, 8]} wrap>
            <Button
              aria-label={messages.syntaxAssistant.insertAfterLine}
              icon={<InsertRowBelowOutlined />}
              disabled={!canInsertAfterLine}
              onClick={() => onInsertAfterLine(diagnostic.line!, diagnostic.rule!.snippet)}
            >
              {messages.syntaxAssistant.insertAfterLine}
            </Button>
            <Button
              aria-label={messages.syntaxAssistant.insertAtCursor}
              disabled={!canInsert}
              onClick={() => onInsertAtCursor(diagnostic.rule!.snippet)}
            >
              {messages.syntaxAssistant.insertAtCursor}
            </Button>
          </Space>
        </div>
      ) : null}
      <details className="syntaxAssistantDetails">
        <summary>{messages.syntaxAssistant.technicalDetails}</summary>
        <Typography.Paragraph code>{diagnostic.rawMessage}</Typography.Paragraph>
        <Button
          aria-label={messages.syntaxAssistant.copyTechnicalDetails}
          icon={<CopyOutlined />}
          onClick={() => onCopyRawMessage(diagnostic.rawMessage)}
        >
          {messages.syntaxAssistant.copyTechnicalDetails}
        </Button>
      </details>
    </section>
  );
}

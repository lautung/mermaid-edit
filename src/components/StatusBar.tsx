import { Badge, Space, Tag, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useI18n } from "../i18n/useI18n";
import type { RenderState } from "../types";

type StatusBarProps = {
  renderState: RenderState;
  sourceLength: number;
  zoom: number;
};

export function StatusBar({ renderState, sourceLength, zoom }: StatusBarProps) {
  const { messages } = useI18n();
  const statusMessage =
    renderState.status === "error" && renderState.diagnostic
      ? renderState.diagnostic.summary
      : renderState.message;
  const badgeStatus =
    renderState.status === "ready"
      ? "success"
      : renderState.status === "error"
        ? "error"
        : renderState.status === "rendering"
          ? "processing"
          : "default";

  return (
    <footer className="statusBar">
      <Space size={18} wrap>
        <Badge status={badgeStatus} text={statusMessage} />
        <Typography.Text type="secondary">{messages.status.characters(sourceLength)}</Typography.Text>
        <Typography.Text type="secondary">{messages.status.previewZoom(zoom)}</Typography.Text>
      </Space>
      <Tag icon={<LockOutlined />} color="default">
        {messages.status.privacy}
      </Tag>
    </footer>
  );
}

import { Badge, Space, Tag, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import type { RenderState } from "../types";

type StatusBarProps = {
  renderState: RenderState;
  sourceLength: number;
  zoom: number;
};

export function StatusBar({ renderState, sourceLength, zoom }: StatusBarProps) {
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
        <Typography.Text type="secondary">{sourceLength} 字符</Typography.Text>
        <Typography.Text type="secondary">预览缩放 {zoom}%</Typography.Text>
      </Space>
      <Tag icon={<LockOutlined />} color="default">
        所有处理在浏览器本地完成，不会上传数据
      </Tag>
    </footer>
  );
}

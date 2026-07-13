import { App as AntApp } from "antd";
import { useI18n } from "../i18n/useI18n";
import type { DiagramSettings, ExportFormat } from "../types";
import { copySvg, downloadMarkdown, downloadRaster, downloadSvg } from "../utils/exportDiagram";
import { formatMermaidMarkdown } from "../utils/markdownMermaid";

type UseExportActionsOptions = {
  svg: string;
  source: string;
  filename: string;
  scale: number;
  background: DiagramSettings["background"];
};

export function useExportActions({
  svg,
  source,
  filename,
  scale,
  background,
}: UseExportActionsOptions) {
  const { message } = AntApp.useApp();
  const { messages } = useI18n();

  const handleExport = async (format: ExportFormat) => {
    if (!svg) {
      return;
    }

    try {
      if (format === "svg") {
        downloadSvg(svg, filename);
      } else {
        await downloadRaster(svg, format, scale, {
          filename,
          background,
        });
      }
      message.success(messages.feedback.exported(format.toUpperCase()));
    } catch (error) {
      message.error(error instanceof Error ? error.message : messages.feedback.exportFailed);
    }
  };

  const handleExportMarkdown = () => {
    downloadMarkdown(formatMermaidMarkdown(source), filename);
    message.success(messages.feedback.markdownExported);
  };

  const handleCopySvg = async () => {
    if (!svg) {
      return;
    }

    try {
      await copySvg(svg);
      message.success(messages.feedback.svgCopied);
    } catch {
      message.error(messages.feedback.copyFailed);
    }
  };

  return {
    handleCopySvg,
    handleExport,
    handleExportMarkdown,
  };
}

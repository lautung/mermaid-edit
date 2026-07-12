export type ExportFormat = "svg" | "png" | "jpg";

export type MermaidTheme = "default" | "base" | "dark" | "forest" | "neutral";

export type MermaidLayout = "dagre" | "elk";

export type MermaidCurve = "basis" | "bumpX" | "linear" | "monotoneX" | "natural" | "step";

export type MermaidFontFamily = "Inter" | "system-ui" | "monospace";

export type DiagramSettings = {
  theme: MermaidTheme;
  background: "transparent" | string;
  fontFamily: MermaidFontFamily;
  layout: MermaidLayout;
  curve: MermaidCurve;
};

export type DiagramSettingKey = keyof DiagramSettings;

export type MarkdownMermaidBlock = {
  index: number;
  source: string;
};

export type RenderState =
  | { status: "idle"; message: string }
  | { status: "rendering"; message: string }
  | { status: "ready"; message: string }
  | { status: "error"; message: string };

export type ExportFormat = "svg" | "png" | "jpg";

export type MermaidTheme = "default" | "base" | "dark" | "forest" | "neutral";

export type RenderState =
  | { status: "idle"; message: string }
  | { status: "rendering"; message: string }
  | { status: "ready"; message: string }
  | { status: "error"; message: string };

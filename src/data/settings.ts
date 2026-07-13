import type {
  DiagramSettings,
  MermaidCurve,
  MermaidFontFamily,
  MermaidLayout,
  MermaidTheme,
} from "../types";

export const defaultDiagramSettings: DiagramSettings = {
  theme: "base",
  background: "transparent",
  fontFamily: "Inter",
  layout: "dagre",
  curve: "basis",
};

const mermaidThemes = new Set<MermaidTheme>(["default", "base", "dark", "forest", "neutral"]);
const mermaidLayouts = new Set<MermaidLayout>(["dagre", "elk"]);
const mermaidCurves = new Set<MermaidCurve>([
  "basis",
  "bumpX",
  "linear",
  "monotoneX",
  "natural",
  "step",
]);
const mermaidFontFamilies = new Set<MermaidFontFamily>(["Inter", "system-ui", "monospace"]);
const hexColorPattern = /^#[0-9a-f]{6}$/i;

export function normalizeDiagramSettings(value: unknown): DiagramSettings {
  if (!isRecord(value)) {
    return defaultDiagramSettings;
  }

  return {
    theme: readUnion(value.theme, mermaidThemes, defaultDiagramSettings.theme),
    background: readBackground(value.background),
    fontFamily: readUnion(
      value.fontFamily,
      mermaidFontFamilies,
      defaultDiagramSettings.fontFamily,
    ),
    layout: readUnion(value.layout, mermaidLayouts, defaultDiagramSettings.layout),
    curve: readUnion(value.curve, mermaidCurves, defaultDiagramSettings.curve),
  };
}

function readUnion<Value extends string>(
  value: unknown,
  allowedValues: Set<Value>,
  fallback: Value,
) {
  return typeof value === "string" && allowedValues.has(value as Value) ? (value as Value) : fallback;
}

function readBackground(value: unknown) {
  if (value === "transparent") {
    return value;
  }

  return typeof value === "string" && hexColorPattern.test(value)
    ? value
    : defaultDiagramSettings.background;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

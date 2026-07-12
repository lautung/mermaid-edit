import { parse } from "yaml";
import type { DiagramSettingKey } from "../types";

const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|\s*$)/;

const configKeys: DiagramSettingKey[] = [
  "theme",
  "background",
  "fontFamily",
  "layout",
  "curve",
];

export function getFrontmatterOverrides(source: string) {
  const match = source.match(frontmatterPattern);
  if (!match) {
    return { hasFrontmatter: false, overriddenKeys: [] as DiagramSettingKey[] };
  }

  try {
    const document = parse(match[1]) as { config?: Record<string, unknown> } | null;
    const config = document?.config;
    if (!config || typeof config !== "object") {
      return { hasFrontmatter: true, overriddenKeys: [] as DiagramSettingKey[] };
    }

    const overriddenKeys = configKeys.filter((key) => {
      if (key === "curve") {
        return hasNestedValue(config, "flowchart", "curve");
      }
      if (key === "background") {
        return (
          Object.prototype.hasOwnProperty.call(config, "background") ||
          hasNestedValue(config, "themeVariables", "background")
        );
      }
      return Object.prototype.hasOwnProperty.call(config, key);
    });

    return { hasFrontmatter: true, overriddenKeys };
  } catch {
    return {
      hasFrontmatter: true,
      overriddenKeys: [] as DiagramSettingKey[],
      error: "Frontmatter 配置格式无法解析",
    };
  }
}

function hasNestedValue(value: Record<string, unknown>, parent: string, key: string) {
  const nested = value[parent];
  return Boolean(nested && typeof nested === "object" && Object.prototype.hasOwnProperty.call(nested, key));
}

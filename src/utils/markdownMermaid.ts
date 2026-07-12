import type { MarkdownMermaidBlock } from "../types";

const mermaidFencePattern = /^\s*```mermaid[^\r\n]*\r?\n([\s\S]*?)^\s*```\s*$/gim;

export function extractMermaidBlocks(markdown: string): MarkdownMermaidBlock[] {
  return Array.from(markdown.matchAll(mermaidFencePattern), (match, index) => ({
    index: index + 1,
    source: match[1].trim(),
  })).filter((block) => block.source.length > 0);
}

export function formatMermaidMarkdown(source: string) {
  return `\`\`\`mermaid\n${source.trim()}\n\`\`\`\n`;
}

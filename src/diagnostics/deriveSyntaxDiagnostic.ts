import { repairRules } from "./repairRules";
import { messages } from "../i18n/messages";
import type { DiagnosticMessages } from "../i18n/types";
import type { SyntaxDiagnostic } from "./types";

export function deriveSyntaxDiagnostic(
  source: string,
  error: unknown,
  diagnosticMessages: DiagnosticMessages = messages["zh-CN"].diagnostics,
): SyntaxDiagnostic {
  const rawMessage = error instanceof Error ? error.message : diagnosticMessages.unknownError;
  const rule = repairRules.find((candidate) => candidate.matches(source));

  if (rule) {
    const ruleText = diagnosticMessages.rules[rule.id] ?? {
      title: diagnosticMessages.genericRuleTitle,
      summary: diagnosticMessages.genericRuleSummary,
    };

    return {
      line: rule.line(source),
      summary: `${diagramLabel(rule.diagramKind, diagnosticMessages)}：${ruleText.summary}`,
      manualFixHint: diagnosticMessages.manualFixHint,
      rawMessage,
      rule: {
        id: rule.id,
        title: ruleText.title,
        snippet: rule.snippet,
      },
    };
  }

  return {
    line: extractLine(rawMessage),
    summary: diagnosticMessages.unknownSummary,
    manualFixHint: diagnosticMessages.manualFixHint,
    rawMessage,
  };
}

function extractLine(message: string) {
  const match = /(?:line|第)\s*(\d+)\s*(?:行)?/i.exec(message);
  return match ? Number(match[1]) : undefined;
}

function diagramLabel(kind: string, diagnosticMessages: DiagnosticMessages) {
  return diagnosticMessages.diagramLabels[kind] ?? "Mermaid";
}

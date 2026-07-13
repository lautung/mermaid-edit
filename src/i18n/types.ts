import type { ReactNode } from "react";
import type { DiagramSettingKey } from "../types";

export type LocaleCode = "zh-CN" | "zh-HK" | "en" | "ja" | "ko" | "ru";

export type LocaleOption = {
  value: LocaleCode;
  label: string;
  nativeLabel: string;
};

export type TemplateText = {
  title: string;
  type: string;
  tags: string[];
};

export type DiagnosticRuleText = {
  title: string;
  summary: string;
};

export type DiagnosticMessages = {
  manualFixHint: string;
  unknownError: string;
  unknownSummary: string;
  genericRuleTitle: string;
  genericRuleSummary: string;
  diagramLabels: Record<string, string>;
  rules: Record<string, DiagnosticRuleText>;
};

export type AppMessages = {
  localeName: string;
  app: {
    title: string;
    localTag: string;
    saved: string;
    customDiagram: string;
    loadedTemplate: (title: string) => string;
    loadedTemplateDescription: string;
    customDiagramDescription: string;
  };
  common: {
    export: string;
    cancel: string;
    loading: string;
    diagramFallback: string;
  };
  language: {
    label: string;
  };
  sider: {
    libraryTitle: string;
    searchPlaceholder: string;
    chartTypes: string;
    templateList: string;
    emptyTemplates: string;
    manageTemplates: string;
  };
  templateManager: {
    title: string;
    searchAriaLabel: string;
    searchPlaceholder: string;
    filterTypeAriaLabel: string;
    allTypes: string;
    listAriaLabel: string;
    currentTemplate: string;
    loadTemplate: string;
    emptyTemplates: string;
    commonTag: string;
  };
  header: {
    copySvg: string;
    exportSvg: string;
    exportPng: string;
    exportJpg: string;
    exportMarkdown: string;
    resetTemplateTooltip: string;
  };
  feedback: {
    exported: (format: string) => string;
    exportFailed: string;
    markdownExported: string;
    svgCopied: string;
    copyFailed: string;
    templateLoaded: (title: string) => string;
    markdownImported: string;
  };
  editor: {
    ariaLabel: string;
    codeTab: string;
    markdownTab: string;
    syntaxPassed: string;
    syntaxFailed: string;
    lineLength: (lines: number, length: number) => string;
    codeEditorAriaLabel: string;
  };
  preview: {
    ariaLabel: string;
    previewTab: string;
    exportCheckTab: string;
    errorTab: string;
    syntaxErrorTitle: string;
    syntaxErrorDescription: string;
    emptyDescription: string;
    exportable: string;
    fixSyntaxError: string;
    filename: (filename: string) => string;
    exportScale: (scale: number) => string;
  };
  settings: {
    ariaLabel: string;
    title: string;
    fields: Record<DiagramSettingKey | "scale" | "filename", string>;
    backgroundOptions: {
      transparent: string;
      white: string;
      lightGray: string;
      custom: string;
    };
    fontOptions: {
      inter: string;
      system: string;
      monospace: string;
    };
    layoutOptions: {
      dagre: string;
      elk: string;
    };
    curveOptions: {
      basis: string;
      linear: string;
      bumpX: string;
      monotoneX: string;
      natural: string;
      step: string;
    };
    customBackgroundAriaLabel: string;
    sourceOverrideTag: string;
    sourceOverrideMessage: (fields: string) => string;
    sourceOverrideDescription: string;
    previewZoom: string;
    resetView: string;
  };
  markdownImport: {
    title: string;
    okText: string;
    description: string;
    chooseFile: string;
    readError: string;
    noBlocks: string;
    selectBlockAriaLabel: string;
    blockLabel: (index: number) => string;
    blocksFound: (count: number) => string;
  };
  status: {
    characters: (count: number) => string;
    previewZoom: (zoom: number) => string;
    privacy: string;
  };
  render: {
    waiting: string;
    empty: string;
    rendering: string;
    ready: string;
  };
  syntaxAssistant: {
    ariaLabel: string;
    lineTag: (line: number) => string;
    focusError: string;
    safeSnippet: string;
    insertAfterLine: string;
    insertAtCursor: string;
    technicalDetails: string;
    copyTechnicalDetails: string;
  };
  templates: Record<string, TemplateText>;
  diagnostics: DiagnosticMessages;
};

export type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  messages: AppMessages;
  templateText: (templateId: string, fallback: TemplateText) => TemplateText;
  diagnosticMessages: DiagnosticMessages;
  renderWithLocale: (children: ReactNode) => ReactNode;
};

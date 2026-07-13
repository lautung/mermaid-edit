import { createContext } from "react";
import { messages } from "./messages";
import type { I18nContextValue, TemplateText } from "./types";

const defaultMessages = messages["zh-CN"];

export const I18nContext = createContext<I18nContextValue>({
  locale: "zh-CN",
  setLocale: () => {},
  messages: defaultMessages,
  diagnosticMessages: defaultMessages.diagnostics,
  templateText(_templateId: string, fallback: TemplateText) {
    return fallback;
  },
  renderWithLocale(children) {
    return children;
  },
});

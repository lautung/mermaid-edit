import { useMemo } from "react";
import type { ReactNode } from "react";
import { I18nContext } from "./I18nContext";
import { messages } from "./messages";
import type { I18nContextValue, LocaleCode, TemplateText } from "./types";

type I18nProviderProps = {
  locale: LocaleCode;
  onLocaleChange: (locale: LocaleCode) => void;
  children: ReactNode;
};

export function I18nProvider({ locale, onLocaleChange, children }: I18nProviderProps) {
  const value = useMemo<I18nContextValue>(() => {
    const localeMessages = messages[locale];

    return {
      locale,
      setLocale: onLocaleChange,
      messages: localeMessages,
      diagnosticMessages: localeMessages.diagnostics,
      templateText(templateId: string, fallback: TemplateText) {
        return localeMessages.templates[templateId] ?? fallback;
      },
      renderWithLocale(nextChildren) {
        return nextChildren;
      },
    };
  }, [locale, onLocaleChange]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

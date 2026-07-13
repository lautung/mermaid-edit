# Design

## Architecture

Introduce a small in-repo i18n layer under `src/i18n/` instead of adding a new runtime dependency. The app only needs static dictionaries and simple interpolation, so a local typed dictionary keeps the bundle and integration surface small.

## Locale Model

- `LocaleCode` is a union of `zh-CN | zh-HK | en | ja | ko | ru`.
- `localeOptions` drives the selector labels.
- The selected locale is stored with `useLocalStorage`.
- `ConfigProvider` receives the matching Ant Design locale object.

## Translation Flow

- `src/i18n/messages.ts` owns UI messages, option labels, template metadata, and diagnostic rule text.
- `src/i18n/I18nProvider.tsx` exposes `locale`, `setLocale`, `t`, `format`, `templates`, and `diagnostics`.
- Components consume the hook and receive translated props where possible.
- `deriveSyntaxDiagnostic` accepts locale-specific diagnostic messages so render errors are localized without making diagnostics depend on React.
- `repairRules` stores stable ids and snippets; localized titles/summaries are overlaid by id.

## Compatibility

Existing local storage keys for source and settings are preserved. The new key is only for locale selection. Existing Mermaid source examples remain unchanged, so previously saved diagrams and tests that validate Mermaid syntax are not affected by localized template labels.

## Trade-Offs

This approach does not introduce pluralization libraries or remote translation loading. That is acceptable for the current fixed locale set and short UI strings. If the app later needs dynamic content or full ICU plural rules, the local API can be adapted behind the same `useI18n` surface.

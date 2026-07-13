import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import koKR from "antd/locale/ko_KR";
import ruRU from "antd/locale/ru_RU";
import zhCN from "antd/locale/zh_CN";
import zhHK from "antd/locale/zh_HK";
import type { Locale } from "antd/es/locale";
import type { LocaleCode } from "./types";

export const antdLocales: Record<LocaleCode, Locale> = {
  "zh-CN": zhCN,
  "zh-HK": zhHK,
  en: enUS,
  ja: jaJP,
  ko: koKR,
  ru: ruRU,
};

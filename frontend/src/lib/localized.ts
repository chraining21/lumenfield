import type { DataLocale, LocalizedText } from "@/types";

// URL locales (routing.ts) use "zh-TW"; data fields use "zh".
export function toDataLocale(locale: string): DataLocale {
  return locale === "en" ? "en" : "zh";
}

export function localized(text: LocalizedText, locale: string): string {
  return text[toDataLocale(locale)];
}

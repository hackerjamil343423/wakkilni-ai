"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/i18n";

export type TranslationKey = string;

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return { t, language };
}

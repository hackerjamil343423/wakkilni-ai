import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const translations = {
  en,
  ar,
};

export type TranslationKey = keyof typeof en | string;

// Helper function to get nested translation values
export function getTranslationValue(locale: "en" | "ar", key: string): string {
  const keys = key.split(".");
  let value: any = translations[locale];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}

// Get all translation keys for a namespace
export function getNamespaceTranslations(locale: "en" | "ar", namespace: string) {
  return translations[locale]?.[namespace as keyof typeof translations[typeof locale]] || {};
}

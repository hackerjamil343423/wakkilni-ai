export const i18nConfig = {
  locales: ["en", "ar"] as const,
  defaultLocale: "en" as const,
  fallbackLocale: "en" as const,
};

export type Locale = (typeof i18nConfig.locales)[number];

export const localeNames: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: "English", nativeName: "English", flag: "🇺🇸" },
  ar: { name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
};

export type TranslationKey = string;

export type Locale = "en" | "ar";

export interface TranslationValue {
  [key: string]: string | TranslationValue;
}

export interface Translations {
  [locale: string]: TranslationValue;
}

"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Check } from "lucide-react";

const languages = [
  { code: "en" as const, name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ar" as const, name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Display Language</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred language for the interface
        </p>
      </div>

      <div className="grid gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`
              flex items-center justify-between p-4 rounded-lg border-2 transition-all
              ${language === lang.code
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-left">
                <div className="font-medium">{lang.name}</div>
                <div className="text-sm text-muted-foreground">
                  {lang.nativeName}
                </div>
              </div>
            </div>
            {language === lang.code && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

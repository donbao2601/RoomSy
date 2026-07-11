"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-body hover:border-primary hover:text-primary"
      aria-label="Toggle language"
    >
      {locale === "vi" ? "VI" : "EN"}
    </button>
  );
}

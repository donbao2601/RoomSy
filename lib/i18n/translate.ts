import { dictionary } from "./dictionary";
import type { Locale } from "./locale";

export function t(locale: Locale, key: string): string {
  return dictionary[locale]?.[key] ?? dictionary.vi[key] ?? key;
}

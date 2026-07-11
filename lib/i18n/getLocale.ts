import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./locale";

/** Server-only: đọc ngôn ngữ hiện tại từ cookie, mặc định 'vi'. */
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "vi";
}

import Link from "next/link";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

export function AdminNav({ locale }: { locale: Locale }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      <Link
        href="/admin/users"
        className="rounded-lg bg-background-soft px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
      >
        {t(locale, "admin.nav.users")}
      </Link>
      <Link
        href="/admin/listings/pending"
        className="rounded-lg bg-background-soft px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
      >
        {t(locale, "admin.nav.pendingListings")}
      </Link>
    </nav>
  );
}

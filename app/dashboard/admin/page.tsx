import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";

export default function AdminDashboardPage() {
  const locale = getLocale();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-ink">
          {t(locale, "admin.title")}
        </h1>
        <p className="mt-2 text-sm text-body">{t(locale, "admin.subtitle")}</p>
      </div>
    </main>
  );
}

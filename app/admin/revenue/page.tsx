import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { AdminNav } from "@/components/admin/AdminNav";
import { getMonthlyRevenue } from "@/lib/mock/revenue";
import { formatCurrency } from "@/lib/format";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";

export default async function AdminRevenuePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const locale = getLocale();
  const months = getMonthlyRevenue();
  const maxTotal = Math.max(...months.map((m) => m.total));

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <AdminNav locale={locale} />

        <h1 className="text-xl font-semibold text-ink">
          {t(locale, "admin.revenue.title")}
        </h1>
        <p className="mt-1 text-xs text-muted">{t(locale, "admin.revenue.note")}</p>

        <div className="mt-6 rounded-xl bg-background-soft p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">
              {t(locale, "admin.revenue.chartTitle")}
            </h2>
            <div className="flex items-center gap-3 text-xs text-body">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                {t(locale, "admin.revenue.legendVip")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                {t(locale, "admin.revenue.legendPromotion")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-info" />
                {t(locale, "admin.revenue.legendBoost")}
              </span>
            </div>
          </div>

          <div className="flex h-48 items-end justify-between gap-3">
            {months.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full flex-col-reverse overflow-hidden rounded-md bg-line">
                  <div
                    className="w-full bg-primary"
                    style={{ height: `${(m.vipRevenue / maxTotal) * 100}%` }}
                  />
                  <div
                    className="w-full bg-gold"
                    style={{ height: `${(m.promotionRevenue / maxTotal) * 100}%` }}
                  />
                  <div
                    className="w-full bg-info"
                    style={{ height: `${(m.boostRevenue / maxTotal) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted">
                  {m.month.slice(5)}/{m.month.slice(0, 4)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl bg-background-soft shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="px-4 py-3 font-medium">
                  {t(locale, "admin.revenue.colMonth")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t(locale, "admin.revenue.colVip")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t(locale, "admin.revenue.colPromotion")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t(locale, "admin.revenue.colBoost")}
                </th>
                <th className="px-4 py-3 font-medium">
                  {t(locale, "admin.revenue.colTotal")}
                </th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">{m.month}</td>
                  <td className="px-4 py-3 text-body">
                    {formatCurrency(m.vipRevenue)}
                  </td>
                  <td className="px-4 py-3 text-body">
                    {formatCurrency(m.promotionRevenue)}
                  </td>
                  <td className="px-4 py-3 text-body">
                    {formatCurrency(m.boostRevenue)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {formatCurrency(m.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

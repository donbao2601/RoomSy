import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentMonthRevenue } from "@/lib/mock/revenue";
import { formatCurrency } from "@/lib/format";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";

export default async function AdminOverviewPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const locale = getLocale();
  const supabase = createClient();

  const [{ count: totalUsers }, { data: listingStatuses }, { count: pendingReports }] =
    await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("status"),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const totalListings = listingStatuses?.length ?? 0;
  const byStatus: Record<string, number> = {};
  listingStatuses?.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  });

  const monthlyRevenue = getCurrentMonthRevenue();

  const tiles = [
    { label: t(locale, "admin.overview.totalUsers"), value: totalUsers ?? 0 },
    { label: t(locale, "admin.overview.totalListings"), value: totalListings },
    {
      label: t(locale, "admin.overview.monthlyRevenue"),
      value: formatCurrency(monthlyRevenue.total),
      note: t(locale, "admin.overview.monthlyRevenueNote"),
    },
    {
      label: t(locale, "admin.overview.pendingReports"),
      value: pendingReports ?? 0,
    },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <AdminNav locale={locale} />

        <h1 className="mb-4 text-xl font-semibold text-ink">
          {t(locale, "admin.overview.title")}
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-xl bg-background-soft p-4 shadow-sm"
            >
              <p className="text-xs text-muted">{tile.label}</p>
              <p className="mt-1 text-xl font-bold text-primary">{tile.value}</p>
              {tile.note && (
                <p className="mt-0.5 text-[11px] text-muted">{tile.note}</p>
              )}
            </div>
          ))}
        </div>

        {totalListings > 0 && (
          <div className="mt-6 rounded-xl bg-background-soft p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold text-ink">
              {t(locale, "admin.overview.totalListings")}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byStatus).map(([status, count]) => (
                <span
                  key={status}
                  className="rounded-full bg-background px-3 py-1 text-xs text-body"
                >
                  {t(locale, `status.${status}`)}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { effectiveVipTier, currentPeriod, VIP_QUOTA } from "@/lib/vip";
import { VIP_TIERS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";

export default async function LandlordOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const locale = getLocale();
  const supabase = createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, status, view_count, expires_at, reject_reason")
    .eq("user_id", user.id);

  const all = listings ?? [];
  const activeListings = all.filter((l) => l.status === "active").length;
  const totalViews = all.reduce((sum, l) => sum + (l.view_count ?? 0), 0);

  const ids = all.map((l) => l.id);
  const { count: totalFavorites } = ids.length
    ? await supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .in("listing_id", ids)
    : { count: 0 };

  const { data: quota } = await supabase
    .from("vip_quota_usage")
    .select("boost_used")
    .eq("user_id", user.id)
    .eq("period", currentPeriod())
    .maybeSingle();

  const vipTier = effectiveVipTier(user);
  const vipInfo = VIP_TIERS.find((v) => v.value === vipTier);
  const boostLimit = VIP_QUOTA[vipTier].boost;
  const boostRemaining = Math.max(0, boostLimit - (quota?.boost_used ?? 0));

  const now = Date.now();
  const notifications = all.filter(
    (l) =>
      l.status === "rejected" ||
      (l.status === "active" && new Date(l.expires_at).getTime() < now)
  );

  const tiles = [
    { label: t(locale, "dashboard.landlord.activeListings"), value: activeListings },
    { label: t(locale, "dashboard.landlord.totalViews"), value: totalViews },
    { label: t(locale, "dashboard.landlord.totalContacts"), value: 0 },
    { label: t(locale, "dashboard.landlord.totalFavorites"), value: totalFavorites ?? 0 },
  ];

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-xl font-semibold text-ink">
          {t(locale, "dashboard.landlord.title")}
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-xl bg-background-soft p-4 shadow-sm"
            >
              <p className="text-xs text-muted">{tile.label}</p>
              <p className="mt-1 text-xl font-bold text-primary">{tile.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-background-soft p-4 shadow-sm">
            <p className="text-xs text-muted">
              {t(locale, "dashboard.landlord.currentVip")}
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {vipInfo?.label ?? t(locale, "vip.free")}
            </p>
            {vipTier !== "none" && user.vip_expires_at && (
              <p className="mt-1 text-xs text-muted">
                {t(locale, "vip.expiresOn")}:{" "}
                {new Date(user.vip_expires_at).toLocaleDateString("vi-VN")}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-background-soft p-4 shadow-sm">
            <p className="text-xs text-muted">
              {t(locale, "dashboard.landlord.boostRemaining")}
            </p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {boostRemaining} / {boostLimit}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-background-soft p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            {t(locale, "dashboard.landlord.notifications")}
          </h2>
          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((l) => (
                <li key={l.id} className="text-sm">
                  <Link
                    href="/dashboard/landlord/listings"
                    className="font-medium text-ink hover:text-primary"
                  >
                    {l.title}
                  </Link>
                  {l.status === "rejected" ? (
                    <p className="text-xs text-error">
                      {t(locale, "dashboard.landlord.notifRejected")}
                      {l.reject_reason ? `: ${l.reject_reason}` : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-warning">
                      {t(locale, "dashboard.landlord.notifExpired")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-body">
              {t(locale, "dashboard.landlord.noNotifications")}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

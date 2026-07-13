import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { ListingCard } from "@/components/listings/ListingCard";
import { ProfileForm } from "@/components/tenant/ProfileForm";
import { NotifyToggle } from "@/components/tenant/NotifyToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import {
  MOCK_SEARCH_HISTORY,
  MOCK_CONTACT_HISTORY,
  MOCK_NOTIFICATIONS,
} from "@/lib/mock/tenant";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import type { ListingWithOwner } from "@/lib/types";

export default async function TenantOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const locale = getLocale();
  const supabase = createClient();

  const { data: favoriteRows } = await supabase
    .from("favorites")
    .select("id, listing:listings(*, owner:users(vip_tier, vip_expires_at))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favoriteListings = (favoriteRows ?? [])
    .map((f) => f.listing)
    .filter(Boolean) as unknown as ListingWithOwner[];

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-xl font-semibold text-ink">
          {t(locale, "dashboard.tenant.title")}
        </h1>

        {/* Hồ sơ cá nhân */}
        <section className="rounded-xl bg-background-soft p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            {t(locale, "dashboard.tenant.profileTitle")}
          </h2>
          <ProfileForm
            userId={user.id}
            fullName={user.full_name}
            phone={user.phone}
            avatarUrl={user.avatar_url}
          />
        </section>

        {/* Tin đã lưu */}
        <section className="rounded-xl bg-background-soft p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            {t(locale, "dashboard.tenant.favoritesTitle")}
          </h2>
          {favoriteListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {favoriteListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-body">
              {t(locale, "dashboard.tenant.favoritesEmpty")}
            </p>
          )}
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Lịch sử tìm kiếm */}
          <section className="rounded-xl bg-background-soft p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-ink">
              {t(locale, "dashboard.tenant.searchHistoryTitle")}
            </h2>
            <ul className="space-y-2">
              {MOCK_SEARCH_HISTORY.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-body">{item.query}</span>
                  <span className="text-xs text-muted">{item.date}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Lịch sử liên hệ */}
          <section className="rounded-xl bg-background-soft p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-ink">
              {t(locale, "dashboard.tenant.contactHistoryTitle")}
            </h2>
            <ul className="space-y-2">
              {MOCK_CONTACT_HISTORY.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-body">
                    {item.landlordName} · {item.phone}
                  </span>
                  <span className="text-xs text-muted">{item.date}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Quản lý tin ở ghép — GĐ4, placeholder */}
          <section className="rounded-xl bg-background-soft p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-ink">
              {t(locale, "dashboard.tenant.roommateTitle")}
            </h2>
            <p className="text-sm text-muted">
              {t(locale, "dashboard.tenant.comingSoon")}
            </p>
          </section>

          {/* Quản lý đánh giá — GĐ4, placeholder */}
          <section className="rounded-xl bg-background-soft p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-ink">
              {t(locale, "dashboard.tenant.reviewsTitle")}
            </h2>
            <p className="text-sm text-muted">
              {t(locale, "dashboard.tenant.comingSoon")}
            </p>
          </section>
        </div>

        {/* Thông báo */}
        <section className="rounded-xl bg-background-soft p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            {t(locale, "dashboard.tenant.notificationsTitle")}
          </h2>
          <ul className="space-y-2">
            {MOCK_NOTIFICATIONS.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-body">{item.title}</span>
                <span className="text-xs text-muted">{item.date}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cài đặt */}
        <section className="rounded-xl bg-background-soft p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            {t(locale, "dashboard.tenant.settingsTitle")}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-body">
                {t(locale, "dashboard.tenant.settingsLanguage")}
              </span>
              <LanguageToggle />
            </div>
            <NotifyToggle />
          </div>
        </section>
      </div>
    </main>
  );
}

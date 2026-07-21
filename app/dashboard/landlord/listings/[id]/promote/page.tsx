import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import { effectiveVipTier, currentPeriod, VIP_QUOTA } from "@/lib/vip";
import { effectiveTier } from "@/lib/promotion";
import { PromotionBadge } from "@/components/listings/PromotionBadge";
import { PromoteForm } from "@/components/listings/PromoteForm";
import type { Listing } from "@/lib/types";

export default async function PromoteListingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .single<Listing>();

  if (!listing) notFound();
  if (listing.user_id !== user.id) redirect("/dashboard/landlord/listings");

  const locale = getLocale();
  const tier = effectiveTier(listing);
  const notExpired = new Date(listing.expires_at).getTime() > Date.now();

  const { data: quota } = await supabase
    .from("vip_quota_usage")
    .select("c_used, b_used, hot_a_used")
    .eq("user_id", user.id)
    .eq("period", currentPeriod())
    .maybeSingle();

  const vipTier = effectiveVipTier(user);
  const limits = VIP_QUOTA[vipTier];
  const quotaRemaining = {
    C: Math.max(0, limits.C - (quota?.c_used ?? 0)),
    B: Math.max(0, limits.B - (quota?.b_used ?? 0)),
    HOT_A: Math.max(0, limits.HOT_A - (quota?.hot_a_used ?? 0)),
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/landlord/listings"
          className="text-sm font-medium text-primary"
        >
          ← {t(locale, "promote.backToManage")}
        </Link>

        <div className="mt-4 rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-xl font-semibold text-ink">
            {t(locale, "promote.pageTitle")}
          </h1>
          <p className="mt-1 truncate text-sm text-body">{listing.title}</p>

          {tier !== "normal" && listing.promoted_until && (
            <p className="mt-2 flex items-center gap-2 text-sm text-body">
              <PromotionBadge tier={tier} locale={locale} />
              {t(locale, "promote.activeUntil")}{" "}
              {new Date(listing.promoted_until).toLocaleString("vi-VN")}
            </p>
          )}

          {!notExpired ? (
            <>
              <p className="mt-4 text-sm text-red-600">
                {t(locale, "manage.expired")}
              </p>
              <Link
                href="/dashboard/landlord/listings"
                className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {t(locale, "promote.backToManage")}
              </Link>
            </>
          ) : listing.status !== "active" ? (
            <>
              <p className="mt-4 text-sm text-red-600">
                {t(locale, "promote.notActiveYet")}
              </p>
              <Link
                href="/dashboard/landlord/listings"
                className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {t(locale, "promote.backToManage")}
              </Link>
            </>
          ) : (
            <div className="mt-5">
              <h2 className="mb-3 text-sm font-semibold text-ink">
                {t(locale, "promote.chooseTier")}
              </h2>
              <PromoteForm listingId={listing.id} quotaRemaining={quotaRemaining} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

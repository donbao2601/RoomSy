import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { effectiveVipTier, isVipActive, currentPeriod, VIP_QUOTA } from "@/lib/vip";
import { VIP_TIERS } from "@/lib/constants";
import { VipUpgradeButton } from "@/components/vip/VipUpgradeButton";

const BENEFIT_ROWS = [
  { key: "C", label: "vip.benefitC" },
  { key: "B", label: "vip.benefitB" },
  { key: "HOT_A", label: "vip.benefitHotA" },
  { key: "boost", label: "vip.benefitBoost" },
] as const;

export default async function VipPage() {
  const locale = getLocale();
  const user = await getCurrentUser();
  const currentTier = user ? effectiveVipTier(user) : "none";

  let quotaUsed = { c_used: 0, b_used: 0, hot_a_used: 0, boost_used: 0 };
  if (user && isVipActive(user)) {
    const supabase = createClient();
    const { data } = await supabase
      .from("vip_quota_usage")
      .select("c_used, b_used, hot_a_used, boost_used")
      .eq("user_id", user.id)
      .eq("period", currentPeriod())
      .maybeSingle();
    if (data) quotaUsed = data;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
          {t(locale, "vip.pageTitle")}
        </h1>
        <p className="mt-2 text-sm text-body sm:text-base">
          {t(locale, "vip.pageSubtitle")}
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {VIP_TIERS.map((tier) => {
          const isCurrent = currentTier === tier.value;
          const isPopular = "popular" in tier && tier.popular;

          return (
            <div
              key={tier.value}
              className={`relative flex flex-col rounded-xl border bg-white p-5 shadow-sm ${
                isPopular ? "border-gold ring-1 ring-gold" : "border-line"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-0.5 text-[11px] font-semibold text-white">
                  {t(locale, "vip.popular")}
                </span>
              )}

              <h2 className="text-sm font-semibold text-ink">{tier.label}</h2>
              <p className="mt-2 text-xl font-bold text-primary">
                {tier.price === 0
                  ? t(locale, "vip.free")
                  : `${tier.price.toLocaleString("vi-VN")}đ`}
              </p>
              {tier.price > 0 && (
                <p className="text-xs text-muted">{t(locale, "vip.perMonth")}</p>
              )}

              <ul className="mt-4 flex-1 space-y-1.5 text-left text-xs text-body">
                <li>
                  {tier.quota.C} {t(locale, "vip.benefitC")}
                </li>
                <li>
                  {tier.quota.B} {t(locale, "vip.benefitB")}
                </li>
                <li>
                  {tier.quota.HOT_A} {t(locale, "vip.benefitHotA")}
                </li>
                <li>
                  {tier.quota.boost} {t(locale, "vip.benefitBoost")}
                </li>
                <li className={tier.priorityReview ? "text-primary" : "text-muted"}>
                  {tier.priorityReview ? "✓" : "✗"} {t(locale, "vip.benefitPriority")}
                </li>
                <li className={tier.badge ? "text-primary" : "text-muted"}>
                  {tier.badge ? "✓" : "✗"} {t(locale, "vip.benefitBadge")}
                </li>
              </ul>

              <div className="mt-4">
                {tier.value === "none" ? (
                  isCurrent ? (
                    <span className="block w-full rounded-lg bg-background px-4 py-2 text-center text-sm font-semibold text-primary">
                      {t(locale, "vip.currentPlan")}
                    </span>
                  ) : (
                    <span className="block w-full rounded-lg px-4 py-2 text-center text-sm text-muted">
                      —
                    </span>
                  )
                ) : (
                  <VipUpgradeButton
                    tier={tier.value}
                    label={tier.label}
                    price={tier.price}
                    isCurrent={isCurrent}
                    isLoggedIn={!!user}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {user && isVipActive(user) && (
        <div className="mx-auto mt-8 max-w-2xl rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-ink">
            {t(locale, "vip.quotaUsed")}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-body sm:grid-cols-4">
            {BENEFIT_ROWS.map((row) => {
              const usedKey =
                row.key === "boost"
                  ? "boost_used"
                  : row.key === "HOT_A"
                    ? "hot_a_used"
                    : row.key === "B"
                      ? "b_used"
                      : "c_used";
              const used = quotaUsed[usedKey as keyof typeof quotaUsed];
              const limit = VIP_QUOTA[currentTier][row.key];
              return (
                <div key={row.key} className="rounded-lg bg-background p-3 text-center">
                  <p className="text-xs text-muted">{t(locale, row.label)}</p>
                  <p className="mt-1 font-semibold text-ink">
                    {used}/{limit}
                  </p>
                </div>
              );
            })}
          </div>
          {user.vip_expires_at && (
            <p className="mt-3 text-xs text-muted">
              {t(locale, "vip.expiresOn")}:{" "}
              {new Date(user.vip_expires_at).toLocaleDateString("vi-VN")}
            </p>
          )}
        </div>
      )}
    </main>
  );
}

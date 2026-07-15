import Link from "next/link";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { effectiveVipTier, isVipActive, currentPeriod, VIP_QUOTA } from "@/lib/vip";
import {
  VIP_TIERS,
  PROMOTION_TIERS,
  PROMOTION_DURATION_DAYS,
  BOOST_PRICE,
} from "@/lib/constants";
import { VipUpgradeButton } from "@/components/vip/VipUpgradeButton";
import { PromotionBadge } from "@/components/listings/PromotionBadge";

type VipTierInfo = (typeof VIP_TIERS)[number];

/** Hỗ trợ ưu tiên / báo cáo hiệu quả tin đăng — chỉ hiển thị marketing, không gắn field DB nào. */
const EXTRA_BENEFITS: Record<string, { support: boolean; report: boolean }> = {
  none: { support: false, report: false },
  dong: { support: false, report: false },
  bac: { support: true, report: true },
  vang: { support: true, report: true },
  kim_cuong: { support: true, report: true },
};

const FEATURE_ROWS: Array<
  | { key: string; label: string; type: "bool"; get: (tier: VipTierInfo) => boolean }
  | { key: string; label: string; type: "num"; get: (tier: VipTierInfo) => number }
> = [
  { key: "badge", label: "vip.benefitBadge", type: "bool", get: (tier) => tier.badge },
  { key: "priorityReview", label: "vip.benefitPriority", type: "bool", get: (tier) => tier.priorityReview },
  { key: "C", label: "vip.benefitC", type: "num", get: (tier) => tier.quota.C },
  { key: "B", label: "vip.benefitB", type: "num", get: (tier) => tier.quota.B },
  { key: "HOT_A", label: "vip.benefitHotA", type: "num", get: (tier) => tier.quota.HOT_A },
  { key: "boost", label: "vip.benefitBoost", type: "num", get: (tier) => tier.quota.boost },
  { key: "support", label: "vip.benefitSupport", type: "bool", get: (tier) => EXTRA_BENEFITS[tier.value].support },
  { key: "report", label: "vip.benefitReport", type: "bool", get: (tier) => EXTRA_BENEFITS[tier.value].report },
];

const QUOTA_USED_ROWS = [
  { key: "C", label: "vip.benefitC", usedKey: "c_used" },
  { key: "B", label: "vip.benefitB", usedKey: "b_used" },
  { key: "HOT_A", label: "vip.benefitHotA", usedKey: "hot_a_used" },
  { key: "boost", label: "vip.benefitBoost", usedKey: "boost_used" },
] as const;

const PROMO_STYLE_KEY: Record<string, string> = {
  C: "promote.styleC",
  B: "promote.styleB",
  HOT_A: "promote.styleHotA",
};

const WHY_ITEMS = [
  { key: "trust", titleKey: "vip.why1Title", bodyKey: "vip.why1Body" },
  { key: "cost", titleKey: "vip.why2Title", bodyKey: "vip.why2Body" },
  { key: "reach", titleKey: "vip.why3Title", bodyKey: "vip.why3Body" },
  { key: "support", titleKey: "vip.why4Title", bodyKey: "vip.why4Body" },
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
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">
          {t(locale, "vip.pageTitle")}
        </h1>
        <p className="mt-2 text-sm text-body sm:text-base">
          {t(locale, "vip.pageSubtitle")}
        </p>
      </div>

      {/* Bảng so sánh gói hội viên */}
      <div className="mx-auto mt-8 max-w-5xl overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-44 border-b border-line bg-background-soft p-4 text-left text-sm font-semibold text-ink">
                {t(locale, "vip.tableHeader")}
              </th>
              {VIP_TIERS.map((tier) => {
                const isCurrent = currentTier === tier.value;
                const isPopular = "popular" in tier && tier.popular;
                return (
                  <th
                    key={tier.value}
                    className={`relative min-w-[140px] border-b border-line p-4 text-center align-top font-normal ${
                      isPopular ? "bg-gold/5" : ""
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-0.5 text-[11px] font-semibold text-white">
                        {t(locale, "vip.popular")}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-ink">{tier.label}</p>
                    <p className="text-xs text-muted">
                      {t(locale, `vip.tagline.${tier.value}`)}
                    </p>
                    <p className="mt-2 text-lg font-bold text-primary">
                      {tier.price === 0
                        ? t(locale, "vip.free")
                        : `${tier.price.toLocaleString("vi-VN")}đ`}
                    </p>
                    {tier.price > 0 && (
                      <p className="text-[11px] text-muted">{t(locale, "vip.perMonth")}</p>
                    )}
                    <div className="mt-3">
                      {tier.value === "none" ? (
                        isCurrent ? (
                          <span className="block rounded-lg bg-background px-3 py-1.5 text-xs font-semibold text-primary">
                            {t(locale, "vip.currentPlan")}
                          </span>
                        ) : (
                          <span className="block text-xs text-muted">—</span>
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
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {FEATURE_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-line last:border-0">
                <td className="p-3 text-xs font-medium text-body sm:text-sm">
                  {t(locale, row.label)}
                </td>
                {VIP_TIERS.map((tier) => {
                  const display =
                    row.type === "bool" ? (row.get(tier) ? "✓" : "—") : String(row.get(tier));
                  return (
                    <td
                      key={tier.value}
                      className={`p-3 text-center text-xs sm:text-sm ${
                        display === "✓"
                          ? "font-semibold text-primary"
                          : display === "—"
                          ? "text-muted"
                          : "font-semibold text-ink"
                      }`}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bảng giá quảng bá tin đăng + Dịch vụ đẩy tin — chỉ CTA điều hướng, KHÔNG mua trực tiếp tại đây */}
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="inline-block rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white">
            {t(locale, "promote.sectionTitle")}
          </h2>

          <div className="mt-4 space-y-3">
            {PROMOTION_TIERS.map((tier) => (
              <div
                key={tier.value}
                className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <PromotionBadge tier={tier.value} locale={locale} />
                  <p className="mt-1 text-xs text-body">
                    {t(locale, PROMO_STYLE_KEY[tier.value])}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-muted">
                    {t(locale, "promote.priorityDaysLabel")} {PROMOTION_DURATION_DAYS}{" "}
                    {t(locale, "promote.daysUnit")}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {tier.price.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted">* {t(locale, "promote.footnote")}</p>

          <Link
            href="/dashboard/landlord/listings"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {t(locale, "promote.ctaButton")}
          </Link>
          <p className="mt-1.5 text-xs text-muted">{t(locale, "promote.ctaNote")}</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="inline-block rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white">
            {t(locale, "boost.sectionTitle")}
          </h2>

          <p className="mt-4 text-sm font-medium text-ink">{t(locale, "boost.description")}</p>
          <ul className="mt-3 space-y-1.5 text-xs text-body">
            {(["boost.benefit1", "boost.benefit2", "boost.benefit3", "boost.benefit4"] as const).map(
              (key) => (
                <li key={key} className="flex items-center gap-2">
                  <span className="text-primary">✓</span> {t(locale, key)}
                </li>
              )
            )}
          </ul>

          <div className="mt-4 rounded-lg bg-background p-3 text-center">
            <p className="text-xs text-muted">{t(locale, "boost.priceLabel")}</p>
            <p className="text-lg font-bold text-primary">
              {BOOST_PRICE.toLocaleString("vi-VN")}đ
            </p>
          </div>

          <Link
            href="/dashboard/landlord/listings"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {t(locale, "boost.ctaButton")}
          </Link>
          <p className="mt-1.5 text-xs text-muted">{t(locale, "boost.ctaNote")}</p>
        </div>
      </div>

      {user && isVipActive(user) && (
        <div className="mx-auto mt-8 max-w-2xl rounded-xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-ink">
            {t(locale, "vip.quotaUsed")}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-body sm:grid-cols-4">
            {QUOTA_USED_ROWS.map((row) => {
              const used = quotaUsed[row.usedKey];
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

      {/* Vì sao nên nâng cấp VIP */}
      <div className="mx-auto mt-10 max-w-5xl">
        <h2 className="text-center text-lg font-semibold text-ink">
          {t(locale, "vip.whyTitle")}
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {WHY_ITEMS.map((item) => (
            <div key={item.key} className="rounded-xl bg-white p-4 text-center shadow-sm">
              <p className="text-sm font-semibold text-ink">{t(locale, item.titleKey)}</p>
              <p className="mt-1 text-xs text-body">{t(locale, item.bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";
import type { PromotionTier } from "@/lib/promotion";

const STYLES: Record<Exclude<PromotionTier, "normal">, string> = {
  C: "text-[11px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded",
  B: "text-xs font-bold uppercase tracking-wide text-gold bg-gold/10 px-2 py-0.5 rounded",
  HOT_A: "text-sm font-extrabold uppercase tracking-wide text-red-600 bg-red-50 px-2.5 py-1 rounded",
};

/** Badge quảng bá — màu/kích cỡ/nhãn theo đúng bảng trong tài liệu. Tin thường không hiện badge. */
export function PromotionBadge({
  tier,
  locale = "vi",
}: {
  tier: PromotionTier;
  locale?: Locale;
}) {
  if (tier === "normal") return null;

  return (
    <span className={STYLES[tier]}>
      {tier === "HOT_A" ? "🔥 " : ""}
      {t(locale, `tier.${tier}`)}
    </span>
  );
}

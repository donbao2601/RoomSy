export type PromotionTier = "normal" | "C" | "B" | "HOT_A";

/** Thứ tự ưu tiên hiển thị khi sort kết quả tìm kiếm — số nhỏ hơn lên trước. */
export const TIER_PRIORITY: Record<PromotionTier, number> = {
  HOT_A: 0,
  B: 1,
  C: 2,
  normal: 3,
};

/** tier hiệu lực — tự fallback về 'normal' nếu promoted_until đã hết hạn. */
export function effectiveTier(listing: {
  tier: string;
  promoted_until: string | null;
}): PromotionTier {
  if (!listing.tier || listing.tier === "normal") return "normal";
  if (!listing.promoted_until) return "normal";
  return new Date(listing.promoted_until).getTime() > Date.now()
    ? (listing.tier as PromotionTier)
    : "normal";
}

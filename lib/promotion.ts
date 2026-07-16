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

/** Màu chữ tiêu đề tin đăng theo tier — đồng bộ với STYLES trong PromotionBadge. */
const TIER_TITLE_COLOR: Record<PromotionTier, string> = {
  normal: "text-ink",
  C: "text-blue-600",
  B: "text-gold",
  HOT_A: "text-red-600",
};

export function getTierTitleColor(tier: PromotionTier): string {
  return TIER_TITLE_COLOR[tier];
}

/** font-weight riêng theo tier — 'normal' trả về rỗng để nơi gọi tự giữ weight sẵn có. */
const TIER_TITLE_FONT_WEIGHT: Record<PromotionTier, string> = {
  normal: "",
  C: "font-semibold",
  B: "font-bold",
  HOT_A: "font-extrabold",
};

export function getTierTitleFontWeight(tier: PromotionTier): string {
  return TIER_TITLE_FONT_WEIGHT[tier];
}

/** text-transform tiêu đề theo tier. */
export function getTierTitleTransform(tier: PromotionTier): string {
  return tier === "normal" ? "normal-case" : "uppercase";
}

const TEXT_SIZE_SCALE = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-5xl",
  "text-6xl",
  "text-7xl",
  "text-8xl",
  "text-9xl",
];

const TIER_TITLE_SIZE_STEP: Record<PromotionTier, number> = {
  normal: 0,
  C: 1,
  B: 2,
  HOT_A: 3,
};

/**
 * Tăng size-step Tailwind text-* theo tier, dựa trên base class đang dùng tại nơi gọi
 * (hỗ trợ nhiều class cách nhau bởi dấu cách, kể cả có responsive prefix vd "sm:text-2xl").
 * Class không thuộc TEXT_SIZE_SCALE được giữ nguyên.
 */
export function getTierTitleSize(baseSizeClasses: string, tier: PromotionTier): string {
  const steps = TIER_TITLE_SIZE_STEP[tier];
  if (steps === 0) return baseSizeClasses;
  return baseSizeClasses
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const colonIdx = token.lastIndexOf(":");
      const prefix = colonIdx >= 0 ? token.slice(0, colonIdx + 1) : "";
      const cls = colonIdx >= 0 ? token.slice(colonIdx + 1) : token;
      const idx = TEXT_SIZE_SCALE.indexOf(cls);
      if (idx === -1) return token;
      return prefix + TEXT_SIZE_SCALE[Math.min(idx + steps, TEXT_SIZE_SCALE.length - 1)];
    })
    .join(" ");
}

/** Icon gắn liền trước tiêu đề theo tier — áp dụng cả 3 nơi (card/chi tiết/bảng landlord). */
const TIER_TITLE_ICON: Record<PromotionTier, string> = {
  normal: "",
  C: "",
  B: "⭐",
  HOT_A: "🔥",
};

export function getTierTitleIcon(tier: PromotionTier): string {
  return TIER_TITLE_ICON[tier];
}

/**
 * Class cho dải nền "highlight chip" bao quanh tiêu đề — chỉ Tin HOT A có giá trị,
 * chỉ dùng ở ListingCard/trang chi tiết (KHÔNG dùng ở bảng landlord).
 * box-decoration-break: clone để nền không vỡ hình khi tiêu đề xuống dòng (line-clamp-2).
 * Glow là bản tĩnh (box-shadow mờ) — TODO: nâng cấp thành shimmer động ở bước sau nếu cần.
 */
const TIER_TITLE_HIGHLIGHT_CLASS: Partial<Record<PromotionTier, string>> = {
  HOT_A:
    "rounded bg-red-50 px-1.5 py-0.5 shadow-[0_0_10px_2px_rgba(220,38,38,0.25)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
};

export function getTierTitleHighlightClass(tier: PromotionTier): string {
  return TIER_TITLE_HIGHLIGHT_CLASS[tier] ?? "";
}

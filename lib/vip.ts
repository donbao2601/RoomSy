export type VipTier = "none" | "dong" | "bac" | "vang" | "kim_cuong";

export type VipQuota = {
  C: number;
  B: number;
  HOT_A: number;
  boost: number;
};

/** Quota miễn phí/tháng theo từng hạng VIP — đúng bảng quyền lợi trong tài liệu. */
export const VIP_QUOTA: Record<VipTier, VipQuota> = {
  none: { C: 0, B: 0, HOT_A: 0, boost: 0 },
  dong: { C: 2, B: 1, HOT_A: 0, boost: 2 },
  bac: { C: 5, B: 3, HOT_A: 1, boost: 5 },
  vang: { C: 10, B: 5, HOT_A: 3, boost: 10 },
  kim_cuong: { C: 20, B: 10, HOT_A: 5, boost: 20 },
};

export function isVipActive(user: {
  vip_tier: string;
  vip_expires_at: string | null;
}): boolean {
  if (!user.vip_tier || user.vip_tier === "none") return false;
  if (!user.vip_expires_at) return false;
  return new Date(user.vip_expires_at).getTime() > Date.now();
}

/** vip_tier hiệu lực — tự fallback về 'none' nếu đã hết hạn. */
export function effectiveVipTier(user: {
  vip_tier: string;
  vip_expires_at: string | null;
}): VipTier {
  return isVipActive(user) ? (user.vip_tier as VipTier) : "none";
}

/** Kỳ hiện tại dạng 'YYYY-MM', dùng làm key theo dõi quota trong vip_quota_usage. */
export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

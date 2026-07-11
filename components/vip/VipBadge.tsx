import { VIP_TIERS } from "@/lib/constants";
import { isVipActive } from "@/lib/vip";

/** Huy hiệu VIP — chỉ hiện khi vip_tier còn hiệu lực (chưa hết vip_expires_at). */
export function VipBadge({
  vip_tier,
  vip_expires_at,
}: {
  vip_tier: string;
  vip_expires_at: string | null;
}) {
  if (!isVipActive({ vip_tier, vip_expires_at })) return null;

  const tierInfo = VIP_TIERS.find((tier) => tier.value === vip_tier);
  if (!tierInfo) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold">
      👑 {tierInfo.label}
    </span>
  );
}

import { createAdminClient } from "@/lib/supabase/admin";
import { currentPeriod } from "@/lib/vip";

type QuotaField = "c_used" | "b_used" | "hot_a_used" | "boost_used";

/**
 * Cố gắng tiêu 1 lượt quota miễn phí trong tháng hiện tại.
 * Trả về true nếu còn quota (đã tăng counter), false nếu hết quota
 * (coi như giao dịch mock-paid — không tăng counter, không chặn hành động).
 */
export async function tryConsumeFreeQuota(
  userId: string,
  field: QuotaField,
  limit: number
): Promise<boolean> {
  if (limit <= 0) return false;

  const admin = createAdminClient();
  const period = currentPeriod();

  const { data: existing } = await admin
    .from("vip_quota_usage")
    .select("id, c_used, b_used, hot_a_used, boost_used")
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();

  const used = existing ? (existing[field as keyof typeof existing] as number) ?? 0 : 0;
  if (used >= limit) return false;

  if (existing) {
    await admin
      .from("vip_quota_usage")
      .update({ [field]: used + 1, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await admin.from("vip_quota_usage").insert({
      user_id: userId,
      period,
      [field]: 1,
    });
  }

  return true;
}

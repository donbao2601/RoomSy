import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { effectiveVipTier, VIP_QUOTA } from "@/lib/vip";
import { PROMOTION_DURATION_DAYS } from "@/lib/constants";
import { tryConsumeFreeQuota } from "@/lib/server/quota";

const VALID_TYPES = ["C", "B", "HOT_A"] as const;
type PromotionType = (typeof VALID_TYPES)[number];

const QUOTA_FIELD: Record<PromotionType, "c_used" | "b_used" | "hot_a_used"> = {
  C: "c_used",
  B: "b_used",
  HOT_A: "hot_a_used",
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const type = body?.type as PromotionType;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Loại quảng bá không hợp lệ" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("id, user_id, status, expires_at")
    .eq("id", params.id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Không tìm thấy tin đăng" }, { status: 404 });
  }
  if (listing.user_id !== user.id) {
    return NextResponse.json({ error: "Bạn không có quyền" }, { status: 403 });
  }
  if (listing.status !== "active") {
    return NextResponse.json(
      { error: "Chỉ quảng bá được tin đang hiển thị" },
      { status: 400 }
    );
  }
  if (new Date(listing.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Tin đã hết hạn 30 ngày" }, { status: 400 });
  }

  const tier = effectiveVipTier(user);
  const limit = VIP_QUOTA[tier][type];
  const usedFreeQuota = await tryConsumeFreeQuota(
    user.id,
    QUOTA_FIELD[type],
    limit
  );

  const promoted_until = new Date(
    Date.now() + PROMOTION_DURATION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await admin
    .from("listings")
    .update({ tier: type, promoted_until })
    .eq("id", listing.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tier: type, promoted_until, usedFreeQuota });
}

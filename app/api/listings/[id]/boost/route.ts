import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { createAdminClient } from "@/lib/supabase/admin";
import { effectiveVipTier, VIP_QUOTA } from "@/lib/vip";
import { BOOST_COOLDOWN_MINUTES } from "@/lib/constants";
import { tryConsumeFreeQuota } from "@/lib/server/quota";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("id, user_id, status, expires_at, last_pushed_at")
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
      { error: "Chỉ đẩy được tin đang hiển thị" },
      { status: 400 }
    );
  }
  if (new Date(listing.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "Tin đã hết hạn 30 ngày" }, { status: 400 });
  }

  if (listing.last_pushed_at) {
    const cooldownMs = BOOST_COOLDOWN_MINUTES * 60 * 1000;
    const elapsed = Date.now() - new Date(listing.last_pushed_at).getTime();
    if (elapsed < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - elapsed) / 60000);
      return NextResponse.json(
        { error: "Vừa đẩy tin gần đây", remainingMinutes },
        { status: 429 }
      );
    }
  }

  const tier = effectiveVipTier(user);
  const usedFreeQuota = await tryConsumeFreeQuota(
    user.id,
    "boost_used",
    VIP_QUOTA[tier].boost
  );

  const last_pushed_at = new Date().toISOString();
  const { error } = await admin
    .from("listings")
    .update({ last_pushed_at })
    .eq("id", listing.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, last_pushed_at, usedFreeQuota });
}

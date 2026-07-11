import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { createAdminClient } from "@/lib/supabase/admin";
import type { VipTier } from "@/lib/vip";

const VALID_TIERS: VipTier[] = ["dong", "bac", "vang", "kim_cuong"];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tier = body?.tier;

  if (!VALID_TIERS.includes(tier)) {
    return NextResponse.json({ error: "Gói VIP không hợp lệ" }, { status: 400 });
  }

  const vip_expires_at = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await createAdminClient()
    .from("users")
    .update({ vip_tier: tier, vip_expires_at })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, vip_tier: tier, vip_expires_at });
}

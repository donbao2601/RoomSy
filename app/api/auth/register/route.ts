import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();
  const { id, email, full_name, phone, role } = body ?? {};

  if (!id || !email || !role || !["tenant", "landlord"].includes(role)) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("users").insert({
    id,
    email,
    full_name: full_name ?? null,
    phone: phone ?? null,
    role,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

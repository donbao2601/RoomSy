import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "tenant" | "landlord" | "admin";
  avatar_url: string | null;
  status: "active" | "banned";
  verified_badge: boolean;
  vip_tier: string;
};

/** Server-side helper: returns the signed-in user's `public.users` row, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select(
      "id, email, full_name, phone, role, avatar_url, status, verified_badge, vip_tier"
    )
    .eq("id", user.id)
    .single();

  return data as CurrentUser | null;
}

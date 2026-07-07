import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function login(email, password) {
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, userId: data.user.id };
}

async function main() {
  const { client: landlordClient, userId: landlordId } = await login(
    "user2@roomsy.vn",
    "111111"
  );
  const { client: tenantClient, userId: tenantId } = await login(
    "user1@roomsy.vn",
    "111111"
  );
  console.log("landlord (user2):", landlordId, "| tenant (user1):", tenantId);

  console.log("\n1) seed test listing as active (via admin)");
  const { data: seeded, error: seedErr } = await admin
    .from("listings")
    .insert({
      user_id: landlordId,
      title: "TEST - Quản lý tin",
      type: "room",
      price: 1500000,
      area: 15,
      city: "TP.HCM",
      images: [],
      amenities: [],
      lifestyle_conditions: [],
      status: "active",
      tier: "normal",
    })
    .select()
    .single();
  if (seedErr) throw seedErr;
  const listingId = seeded.id;
  console.log("   seeded id:", listingId, "status:", seeded.status);

  console.log("\n2) owner toggles hidden (active -> hidden)");
  const { error: hideErr } = await landlordClient
    .from("listings")
    .update({ status: "hidden" })
    .eq("id", listingId);
  const { data: afterHide } = await admin
    .from("listings")
    .select("status")
    .eq("id", listingId)
    .single();
  console.log("   update error:", hideErr?.message ?? "none", "| status now:", afterHide.status);

  console.log("\n3) non-owner (tenant) tries to toggle back to active -- should NOT change");
  const { error: tenantHideErr } = await tenantClient
    .from("listings")
    .update({ status: "active" })
    .eq("id", listingId);
  const { data: afterTenantTry } = await admin
    .from("listings")
    .select("status")
    .eq("id", listingId)
    .single();
  console.log(
    "   tenant update error:",
    tenantHideErr?.message ?? "none (silently no-op expected by RLS)",
    "| status still:",
    afterTenantTry.status
  );

  console.log("\n4) non-owner (tenant) tries to delete -- should fail/no-op");
  const { error: tenantDeleteErr } = await tenantClient
    .from("listings")
    .delete()
    .eq("id", listingId);
  const { data: stillExists } = await admin
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .maybeSingle();
  console.log(
    "   tenant delete error:",
    tenantDeleteErr?.message ?? "none",
    "| still exists:",
    !!stillExists
  );

  console.log("\n5) owner unhides (hidden -> active)");
  await landlordClient.from("listings").update({ status: "active" }).eq("id", listingId);
  const { data: afterUnhide } = await admin
    .from("listings")
    .select("status")
    .eq("id", listingId)
    .single();
  console.log("   status now:", afterUnhide.status);

  console.log("\n6) owner deletes own listing");
  const { error: ownerDeleteErr } = await landlordClient
    .from("listings")
    .delete()
    .eq("id", listingId);
  const { data: afterOwnerDelete } = await admin
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .maybeSingle();
  console.log(
    "   delete error:",
    ownerDeleteErr?.message ?? "none",
    "| still exists (should be null):",
    afterOwnerDelete
  );
}

main().catch((e) => {
  console.error("SCRIPT ERROR", e);
  process.exit(1);
});

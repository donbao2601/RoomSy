import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("1) login as user2@roomsy.vn");
  const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({
    email: "user2@roomsy.vn",
    password: "111111",
  });
  if (signInError || !signInData.user) {
    console.error("LOGIN FAILED", signInError);
    process.exit(1);
  }
  const userId = signInData.user.id;
  console.log("   logged in as", userId);

  console.log("2) upload test image to storage bucket listing-images");
  const fakePng = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108020000009077" +
    "53de0000000c4944415408d763f8cfc0c00000030101003a1a0f0d0000000049454e44ae426082",
    "hex"
  );
  const path = `${userId}/test-listing-image-${Date.now()}.png`;
  const { error: uploadError } = await anon.storage
    .from("listing-images")
    .upload(path, fakePng, { contentType: "image/png" });
  if (uploadError) {
    console.error("UPLOAD FAILED", uploadError);
    process.exit(1);
  }
  console.log("   upload OK:", path);

  const { data: publicUrlData } = anon.storage.from("listing-images").getPublicUrl(path);
  console.log("   public url:", publicUrlData.publicUrl);

  console.log("2b) verify public read works (fetch public URL)");
  const res = await fetch(publicUrlData.publicUrl);
  console.log("   GET status:", res.status);

  console.log("3) insert listing row (status=pending, tier=normal)");
  const { data: inserted, error: insertError } = await anon
    .from("listings")
    .insert({
      user_id: userId,
      title: "TEST - Phòng test tự động",
      type: "room",
      price: 2000000,
      area: 20,
      city: "TP.HCM",
      district: "Quận 1",
      images: [publicUrlData.publicUrl],
      amenities: [],
      lifestyle_conditions: [],
      status: "pending",
      tier: "normal",
    })
    .select()
    .single();

  if (insertError) {
    console.error("INSERT FAILED", insertError);
    process.exit(1);
  }
  console.log("   inserted listing:", {
    id: inserted.id,
    status: inserted.status,
    tier: inserted.tier,
    images: inserted.images,
    user_id_matches: inserted.user_id === userId,
  });

  console.log("4) cleanup: delete storage file + listing row");
  const { error: removeErr } = await admin.storage.from("listing-images").remove([path]);
  console.log("   storage removed:", !removeErr, removeErr?.message ?? "");
  const { error: deleteListingErr } = await admin.from("listings").delete().eq("id", inserted.id);
  console.log("   listing row deleted:", !deleteListingErr, deleteListingErr?.message ?? "");
}

main();

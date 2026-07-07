import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { ListingForm } from "@/components/listings/ListingForm";
import type { Listing } from "@/lib/types";

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .single<Listing>();

  if (!listing || listing.user_id !== user.id) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <h1 className="mx-auto mb-6 max-w-2xl text-xl font-semibold text-neutral-900">
        Chỉnh sửa tin đăng
      </h1>
      <ListingForm mode="edit" userId={user.id} initialListing={listing} />
    </main>
  );
}

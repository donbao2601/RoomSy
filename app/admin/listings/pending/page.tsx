import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { AdminNav } from "@/components/admin/AdminNav";
import { ListingReviewCard } from "@/components/admin/ListingReviewCard";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import type { Listing } from "@/lib/types";

type PendingListing = Listing & {
  owner: { full_name: string | null; phone: string | null; email: string } | null;
};

export default async function AdminPendingListingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const locale = getLocale();
  const supabase = createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, owner:users(full_name, phone, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <AdminNav locale={locale} />

        <h1 className="mb-4 text-xl font-semibold text-ink">
          {t(locale, "admin.pending.title")}
        </h1>

        {listings && listings.length > 0 ? (
          <div className="space-y-4">
            {(listings as unknown as PendingListing[]).map((listing) => (
              <ListingReviewCard
                key={listing.id}
                listing={listing}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-background-soft p-4 text-sm text-body shadow-sm">
            {t(locale, "admin.pending.empty")}
          </p>
        )}
      </div>
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/listings/SearchBar";
import { ListingCard } from "@/components/listings/ListingCard";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import type { ListingWithOwner } from "@/lib/types";

export default async function Home() {
  const supabase = createClient();
  const locale = getLocale();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, owner:users(vip_tier, vip_expires_at)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl md:text-5xl">
          {t(locale, "home.title")}
        </h1>
        <p className="mt-3 text-sm text-body sm:text-base">
          {t(locale, "home.subtitle")}
        </p>
        <div className="mt-6">
          <SearchBar />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl">
        <h2 className="mb-4 text-lg font-semibold text-ink">
          {t(locale, "home.latest")}
        </h2>
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {(listings as unknown as ListingWithOwner[]).map((listing) => (
              <ListingCard key={listing.id} listing={listing} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-body">{t(locale, "home.empty")}</p>
        )}
      </div>
    </main>
  );
}

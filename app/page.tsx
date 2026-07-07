import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/listings/SearchBar";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing } from "@/lib/types";

export default async function Home() {
  const supabase = createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl md:text-5xl">
          Tìm phòng trọ, căn hộ &amp; bạn ở ghép dễ dàng
        </h1>
        <p className="mt-3 text-sm text-neutral-600 sm:text-base">
          ROOMSY — nền tảng cho thuê phòng trọ tại TP.HCM, Hà Nội, Đà Nẵng.
        </p>
        <div className="mt-6">
          <SearchBar />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl">
        <h2 className="mb-4 text-lg font-semibold text-neutral-800">
          Tin đăng mới nhất
        </h2>
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {(listings as Listing[]).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Chưa có tin đăng nào.</p>
        )}
      </div>
    </main>
  );
}

import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ContactButton } from "@/components/listings/ContactButton";
import { formatArea, formatPrice, TYPE_LABELS } from "@/lib/format";
import { AMENITIES, LIFESTYLE_CONDITIONS } from "@/lib/constants";
import type { Listing } from "@/lib/types";

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", params.id)
    .single<Listing>();

  if (!listing || listing.status === "rejected") {
    notFound();
  }

  await createAdminClient()
    .from("listings")
    .update({ view_count: listing.view_count + 1 })
    .eq("id", listing.id);

  const { data: owner } = await supabase
    .from("users")
    .select("full_name, phone")
    .eq("id", listing.user_id)
    .single();

  const currentUser = await getCurrentUser();

  let isFavorited = false;
  if (currentUser) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("listing_id", listing.id)
      .maybeSingle();
    isFavorited = !!favorite;
  }

  const location = [listing.address, listing.district, listing.city]
    .filter(Boolean)
    .join(", ");

  const amenityLabels = listing.amenities
    ?.map((v) => AMENITIES.find((a) => a.value === v)?.label ?? v)
    .filter(Boolean);
  const lifestyleLabels = listing.lifestyle_conditions
    ?.map((v) => LIFESTYLE_CONDITIONS.find((l) => l.value === v)?.label ?? v)
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-xl sm:grid-cols-4">
          {listing.images && listing.images.length > 0 ? (
            listing.images.map((src, i) => (
              <div key={i} className="relative aspect-square bg-neutral-100">
                <Image
                  src={src}
                  alt={`${listing.title} - ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            ))
          ) : (
            <div className="col-span-full flex aspect-video items-center justify-center bg-neutral-100 text-sm text-neutral-400">
              Chưa có ảnh
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              {listing.type && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {TYPE_LABELS[listing.type] ?? listing.type}
                </span>
              )}
              <h1 className="mt-2 text-xl font-semibold text-neutral-900 sm:text-2xl">
                {listing.title}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">{location}</p>
            </div>
            <p className="whitespace-nowrap text-lg font-bold text-primary sm:text-xl">
              {formatPrice(listing.price)}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-600">
            <span>Diện tích: {formatArea(listing.area) || "—"}</span>
            <span>{listing.view_count + 1} lượt xem</span>
          </div>

          {listing.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {listing.description}
            </p>
          )}

          {!!amenityLabels?.length && (
            <div className="mt-5">
              <h2 className="mb-2 text-sm font-semibold text-neutral-800">
                Tiện ích
              </h2>
              <div className="flex flex-wrap gap-2">
                {amenityLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-background px-3 py-1 text-xs text-neutral-600"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!!lifestyleLabels?.length && (
            <div className="mt-4">
              <h2 className="mb-2 text-sm font-semibold text-neutral-800">
                Điều kiện sống
              </h2>
              <div className="flex flex-wrap gap-2">
                {lifestyleLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-background px-3 py-1 text-xs text-neutral-600"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-5">
            <ContactButton phone={owner?.phone ?? null} />
            <FavoriteButton
              listingId={listing.id}
              userId={currentUser?.id ?? null}
              initialFavorited={isFavorited}
            />
            {owner?.full_name && (
              <span className="text-sm text-neutral-500">
                Người đăng: {owner.full_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

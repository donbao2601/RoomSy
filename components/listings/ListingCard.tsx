import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatArea, formatPrice, TYPE_LABELS } from "@/lib/format";

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images?.[0];
  const location = [listing.district, listing.city].filter(Boolean).join(", ");

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Chưa có ảnh
          </div>
        )}
        {listing.type && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-primary">
            {TYPE_LABELS[listing.type] ?? listing.type}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-800">
          {listing.title}
        </h3>
        <p className="mt-1 text-sm font-bold text-primary">
          {formatPrice(listing.price)}
        </p>
        <p className="mt-1 truncate text-xs text-neutral-500">
          {formatArea(listing.area)}
          {listing.area && location ? " · " : ""}
          {location}
        </p>
      </div>
    </Link>
  );
}

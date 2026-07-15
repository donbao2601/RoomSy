import Image from "next/image";
import Link from "next/link";
import type { ListingWithOwner } from "@/lib/types";
import { formatArea, formatPrice, typeLabel } from "@/lib/format";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";
import { effectiveTier, getTierTitleColor } from "@/lib/promotion";
import { PromotionBadge } from "@/components/listings/PromotionBadge";
import { VipBadge } from "@/components/vip/VipBadge";

export function ListingCard({
  listing,
  locale = "vi",
}: {
  listing: ListingWithOwner;
  locale?: Locale;
}) {
  const cover = listing.images?.[0];
  const location = [listing.district, listing.city].filter(Boolean).join(", ");
  const tier = effectiveTier(listing);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl bg-background-soft shadow-sm transition hover:shadow-md"
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
          <div className="flex h-full items-center justify-center text-sm text-muted">
            {t(locale, "listing.noImage")}
          </div>
        )}
        {listing.type && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-primary">
            {typeLabel(locale, listing.type)}
          </span>
        )}
        {tier !== "normal" && (
          <span className="absolute right-2 top-2">
            <PromotionBadge tier={tier} locale={locale} />
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className={`line-clamp-2 text-sm font-semibold ${getTierTitleColor(tier)}`}>
          {listing.title}
        </h3>
        <p className="mt-1 text-sm font-bold text-primary">
          {formatPrice(listing.price)}
        </p>
        <p className="mt-1 truncate text-xs text-body">
          {formatArea(listing.area)}
          {listing.area && location ? " · " : ""}
          {location}
        </p>
        {listing.owner && (
          <VipBadge
            vip_tier={listing.owner.vip_tier}
            vip_expires_at={listing.owner.vip_expires_at}
          />
        )}
      </div>
    </Link>
  );
}

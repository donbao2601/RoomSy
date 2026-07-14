import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { ListingRowActions } from "@/components/listings/ListingRowActions";
import { PromotionBadge } from "@/components/listings/PromotionBadge";
import { formatPrice, STATUS_COLORS, statusLabel } from "@/lib/format";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import { effectiveTier } from "@/lib/promotion";
import type { Listing } from "@/lib/types";

const STATUS_FILTERS = [
  { value: "", key: "manage.statusAll" },
  { value: "pending", key: "manage.statusPending" },
  { value: "active", key: "manage.statusActive" },
  { value: "hidden", key: "manage.statusHidden" },
  { value: "rejected", key: "manage.statusRejected" },
] as const;

export default async function LandlordListingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const locale = getLocale();
  const status = searchParams.status ?? "";
  const supabase = createClient();

  let query = supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: listings } = await query;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">
            {t(locale, "manage.title")}
          </h1>
          <Link
            href="/dashboard/landlord/listings/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {t(locale, "manage.newListing")}
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={
                f.value
                  ? `/dashboard/landlord/listings?status=${f.value}`
                  : "/dashboard/landlord/listings"
              }
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                status === f.value
                  ? "bg-primary text-white"
                  : "bg-white text-body hover:bg-neutral-100"
              }`}
            >
              {t(locale, f.key)}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {listings && listings.length > 0 ? (
            (listings as Listing[]).map((listing) => {
              const tier = effectiveTier(listing);
              return (
                <div
                  key={listing.id}
                  className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {listing.images?.[0] && (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {listing.title}
                      </p>
                      <p className="text-sm text-primary">
                        {formatPrice(listing.price)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[listing.status]
                          }`}
                        >
                          {statusLabel(locale, listing.status)}
                        </span>
                        <PromotionBadge tier={tier} locale={locale} />
                      </div>
                      {listing.status === "rejected" && listing.reject_reason && (
                        <p className="mt-1 text-xs text-red-600">
                          {t(locale, "manage.rejectReason")}: {listing.reject_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <ListingRowActions
                    id={listing.id}
                    status={listing.status}
                    expiresAt={listing.expires_at}
                    lastPushedAt={listing.last_pushed_at}
                  />
                </div>
              );
            })
          ) : (
            <p className="text-sm text-body">{t(locale, "manage.empty")}</p>
          )}
        </div>
      </div>
    </main>
  );
}

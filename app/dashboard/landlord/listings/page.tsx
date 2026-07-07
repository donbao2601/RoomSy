import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { ListingRowActions } from "@/components/listings/ListingRowActions";
import { formatPrice, STATUS_COLORS, STATUS_LABELS } from "@/lib/format";
import type { Listing } from "@/lib/types";

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "active", label: "Đang hiển thị" },
  { value: "hidden", label: "Đã ẩn" },
  { value: "rejected", label: "Bị từ chối" },
];

export default async function LandlordListingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

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
          <h1 className="text-xl font-semibold text-neutral-900">
            Quản lý tin đăng
          </h1>
          <Link
            href="/dashboard/landlord/listings/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            + Đăng tin mới
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
                  : "bg-white text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {listings && listings.length > 0 ? (
            (listings as Listing[]).map((listing) => (
              <div
                key={listing.id}
                className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm"
              >
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
                  <p className="truncate text-sm font-semibold text-neutral-800">
                    {listing.title}
                  </p>
                  <p className="text-sm text-primary">
                    {formatPrice(listing.price)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[listing.status]
                    }`}
                  >
                    {STATUS_LABELS[listing.status]}
                  </span>
                  {listing.status === "rejected" && listing.reject_reason && (
                    <p className="mt-1 text-xs text-red-600">
                      Lý do: {listing.reject_reason}
                    </p>
                  )}
                </div>

                <ListingRowActions id={listing.id} status={listing.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500">
              Bạn chưa có tin đăng nào.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

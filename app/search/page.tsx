import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing } from "@/lib/types";
import {
  AMENITIES,
  CITIES,
  LIFESTYLE_CONDITIONS,
  LISTING_TYPES,
} from "@/lib/constants";

const PAGE_SIZE = 12;

type SearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = first(searchParams.q) ?? "";
  const city = first(searchParams.city) ?? "";
  const district = first(searchParams.district) ?? "";
  const priceMin = first(searchParams.price_min) ?? "";
  const priceMax = first(searchParams.price_max) ?? "";
  const areaMin = first(searchParams.area_min) ?? "";
  const areaMax = first(searchParams.area_max) ?? "";
  const type = first(searchParams.type) ?? "";
  const amenities = list(searchParams.amenities);
  const lifestyle = list(searchParams.lifestyle);
  const page = Math.max(1, parseInt(first(searchParams.page) ?? "1", 10) || 1);

  const supabase = createClient();
  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active");

  if (q) query = query.ilike("title", `%${q}%`);
  if (city) query = query.eq("city", city);
  if (district) query = query.ilike("district", `%${district}%`);
  if (priceMin) query = query.gte("price", Number(priceMin));
  if (priceMax) query = query.lte("price", Number(priceMax));
  if (areaMin) query = query.gte("area", Number(areaMin));
  if (areaMax) query = query.lte("area", Number(areaMax));
  if (type) query = query.eq("type", type);
  if (amenities.length) query = query.contains("amenities", amenities);
  if (lifestyle.length)
    query = query.contains("lifestyle_conditions", lifestyle);

  const offset = (page - 1) * PAGE_SIZE;
  query = query.order("created_at", { ascending: false }).range(
    offset,
    offset + PAGE_SIZE - 1
  );

  const { data: listings, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (district) params.set("district", district);
    if (priceMin) params.set("price_min", priceMin);
    if (priceMax) params.set("price_max", priceMax);
    if (areaMin) params.set("area_min", areaMin);
    if (areaMax) params.set("area_max", areaMax);
    if (type) params.set("type", type);
    amenities.forEach((a) => params.append("amenities", a));
    lifestyle.forEach((l) => params.append("lifestyle", l));
    params.set("page", String(target));
    return `/search?${params.toString()}`;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-xl bg-white p-4 shadow-sm">
          <form method="get" className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Từ khoá
              </label>
              <input name="q" defaultValue={q} className="input" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Thành phố
              </label>
              <select name="city" defaultValue={city} className="input">
                <option value="">Tất cả</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Quận/Huyện
              </label>
              <input name="district" defaultValue={district} className="input" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Loại hình
              </label>
              <select name="type" defaultValue={type} className="input">
                <option value="">Tất cả</option>
                {LISTING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Giá từ
                </label>
                <input
                  type="number"
                  name="price_min"
                  defaultValue={priceMin}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Giá đến
                </label>
                <input
                  type="number"
                  name="price_max"
                  defaultValue={priceMax}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  DT từ (m²)
                </label>
                <input
                  type="number"
                  name="area_min"
                  defaultValue={areaMin}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  DT đến (m²)
                </label>
                <input
                  type="number"
                  name="area_max"
                  defaultValue={areaMax}
                  className="input"
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-1 text-sm font-medium text-neutral-700">
                Tiện ích
              </legend>
              <div className="space-y-1">
                {AMENITIES.map((a) => (
                  <label
                    key={a.value}
                    className="flex items-center gap-2 text-sm text-neutral-600"
                  >
                    <input
                      type="checkbox"
                      name="amenities"
                      value={a.value}
                      defaultChecked={amenities.includes(a.value)}
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1 text-sm font-medium text-neutral-700">
                Điều kiện sống
              </legend>
              <div className="space-y-1">
                {LIFESTYLE_CONDITIONS.map((l) => (
                  <label
                    key={l.value}
                    className="flex items-center gap-2 text-sm text-neutral-600"
                  >
                    <input
                      type="checkbox"
                      name="lifestyle"
                      value={l.value}
                      defaultChecked={lifestyle.includes(l.value)}
                    />
                    {l.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Áp dụng bộ lọc
            </button>
          </form>
        </aside>

        <section>
          <p className="mb-4 text-sm text-neutral-600">
            {count ?? 0} kết quả phù hợp
          </p>

          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {(listings as Listing[]).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Không tìm thấy tin đăng phù hợp.
            </p>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      p === page
                        ? "bg-primary text-white"
                        : "bg-white text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

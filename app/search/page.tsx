import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingCard } from "@/components/listings/ListingCard";
import type { ListingWithOwner } from "@/lib/types";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import { typeLabel } from "@/lib/format";
import { effectiveTier, TIER_PRIORITY } from "@/lib/promotion";
import {
  AMENITIES,
  CITIES,
  LIFESTYLE_CONDITIONS,
  LISTING_TYPES,
} from "@/lib/constants";

const PAGE_SIZE = 12;
// Dữ liệu demo nhỏ nên fetch toàn bộ kết quả đã filter rồi sort/paginate trong
// JS (để sort được theo tier quảng bá hiệu lực + đẩy tin — điều Supabase query
// builder không diễn đạt trực tiếp được). Cap an toàn, không phải giới hạn thật.
const FETCH_CAP = 500;

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
  const locale = getLocale();
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
    .select("*, owner:users(vip_tier, vip_expires_at)")
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

  const { data } = await query
    .order("created_at", { ascending: false })
    .limit(FETCH_CAP);

  const all = (data as unknown as ListingWithOwner[]) ?? [];

  // Sort ưu tiên: HOT A > B > C > Thường (chỉ tính khi còn hiệu lực), phụ theo
  // last_pushed_at (đẩy tin gần nhất lên đầu), rồi tin mới nhất.
  const sorted = [...all].sort((a, b) => {
    const tierDiff = TIER_PRIORITY[effectiveTier(a)] - TIER_PRIORITY[effectiveTier(b)];
    if (tierDiff !== 0) return tierDiff;

    const aPushed = a.last_pushed_at ? new Date(a.last_pushed_at).getTime() : 0;
    const bPushed = b.last_pushed_at ? new Date(b.last_pushed_at).getTime() : 0;
    if (aPushed !== bPushed) return bPushed - aPushed;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const count = sorted.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;
  const listings = sorted.slice(offset, offset + PAGE_SIZE);

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
        <aside className="h-fit rounded-xl bg-background-soft p-4 shadow-sm">
          <form method="get" className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-body">
                {t(locale, "search.keyword")}
              </label>
              <input name="q" defaultValue={q} className="input" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">
                {t(locale, "search.city")}
              </label>
              <select name="city" defaultValue={city} className="input">
                <option value="">{t(locale, "search.all")}</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">
                {t(locale, "search.district")}
              </label>
              <input name="district" defaultValue={district} className="input" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-body">
                {t(locale, "search.type")}
              </label>
              <select name="type" defaultValue={type} className="input">
                <option value="">{t(locale, "search.all")}</option>
                {LISTING_TYPES.map((tp) => (
                  <option key={tp.value} value={tp.value}>
                    {typeLabel(locale, tp.value)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-body">
                  {t(locale, "search.priceFrom")}
                </label>
                <input
                  type="number"
                  name="price_min"
                  defaultValue={priceMin}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-body">
                  {t(locale, "search.priceTo")}
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
                <label className="mb-1 block text-sm font-medium text-body">
                  {t(locale, "search.areaFrom")}
                </label>
                <input
                  type="number"
                  name="area_min"
                  defaultValue={areaMin}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-body">
                  {t(locale, "search.areaTo")}
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
              <legend className="mb-1 text-sm font-medium text-body">
                {t(locale, "search.amenities")}
              </legend>
              <div className="space-y-1">
                {AMENITIES.map((a) => (
                  <label
                    key={a.value}
                    className="flex items-center gap-2 text-sm text-body"
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
              <legend className="mb-1 text-sm font-medium text-body">
                {t(locale, "search.lifestyle")}
              </legend>
              <div className="space-y-1">
                {LIFESTYLE_CONDITIONS.map((l) => (
                  <label
                    key={l.value}
                    className="flex items-center gap-2 text-sm text-body"
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
              {t(locale, "search.apply")}
            </button>
          </form>
        </aside>

        <section>
          <p className="mb-4 text-sm text-body">
            {count} {t(locale, "search.results")}
          </p>

          {listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-body">{t(locale, "search.noResults")}</p>
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
                        : "bg-background-soft text-body hover:bg-background"
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

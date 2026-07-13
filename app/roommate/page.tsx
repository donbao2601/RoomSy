import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RoommatePostCard } from "@/components/roommate/RoommatePostCard";
import { GENDER_OPTIONS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import type { RoommatePostWithAuthor } from "@/lib/types";

const FETCH_CAP = 200;

type SearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RoommateListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const locale = getLocale();
  const type = first(searchParams.type) === "find_person" ? "find_person" : "find_room";
  const district = first(searchParams.district) ?? "";
  const budgetMax = first(searchParams.budget_max) ?? "";
  const gender = first(searchParams.gender) ?? "";

  const supabase = createClient();
  let query = supabase
    .from("roommate_posts")
    .select("*, author:users(full_name, phone, avatar_url)")
    .eq("type", type)
    .eq("status", "active");

  if (district) query = query.ilike("district", `%${district}%`);
  if (budgetMax) query = query.lte("budget", Number(budgetMax));
  if (gender) query = query.eq("gender", gender);

  const { data } = await query
    .order("created_at", { ascending: false })
    .limit(FETCH_CAP);

  const posts = (data as unknown as RoommatePostWithAuthor[]) ?? [];

  function tabHref(target: "find_room" | "find_person") {
    const params = new URLSearchParams();
    params.set("type", target);
    if (district) params.set("district", district);
    if (budgetMax) params.set("budget_max", budgetMax);
    if (gender) params.set("gender", gender);
    return `/roommate?${params.toString()}`;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-ink">
            {t(locale, "roommate.pageTitle")}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/roommate/manage"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t(locale, "roommate.managePosts")}
            </Link>
            <Link
              href="/roommate/new"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              {t(locale, "roommate.newPost")}
            </Link>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <Link
            href={tabHref("find_room")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              type === "find_room"
                ? "bg-primary text-white"
                : "bg-background-soft text-body hover:bg-white"
            }`}
          >
            {t(locale, "roommate.tabFindRoom")}
          </Link>
          <Link
            href={tabHref("find_person")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              type === "find_person"
                ? "bg-primary text-white"
                : "bg-background-soft text-body hover:bg-white"
            }`}
          >
            {t(locale, "roommate.tabFindPerson")}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-xl bg-background-soft p-4 shadow-sm">
            <form method="get" className="space-y-4">
              <input type="hidden" name="type" value={type} />
              <div>
                <label className="mb-1 block text-sm font-medium text-body">
                  {t(locale, "roommate.filterDistrict")}
                </label>
                <input name="district" defaultValue={district} className="input" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-body">
                  {t(locale, "roommate.filterBudgetMax")}
                </label>
                <input
                  type="number"
                  name="budget_max"
                  defaultValue={budgetMax}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-body">
                  {t(locale, "roommate.filterGender")}
                </label>
                <select name="gender" defaultValue={gender} className="input">
                  <option value="">{t(locale, "search.all")}</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {t(locale, `gender.${g.value}`)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {t(locale, "roommate.filterApply")}
              </button>
            </form>
          </aside>

          <section>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <RoommatePostCard key={post.id} post={post} locale={locale} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-body">{t(locale, "roommate.empty")}</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

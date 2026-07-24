"use client";

import { useMemo, useState } from "react";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import type { CommunityCategory, MockCommunityPost } from "@/lib/mock/community";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

const CATEGORIES: CommunityCategory[] = ["guide", "warning", "roommate", "finance"];
type SortOption = "newest" | "popular";

function chipClass(active: boolean, category?: CommunityCategory) {
  if (category === "warning") {
    return active
      ? "bg-warning text-white"
      : "bg-warning-bg text-warning hover:opacity-90";
  }
  return active
    ? "bg-primary text-white"
    : "bg-background-soft text-body hover:bg-white";
}

export function CommunityFeed({
  posts,
  locale,
  initialCategory,
}: {
  posts: MockCommunityPost[];
  locale: Locale;
  initialCategory: string;
}) {
  const [category, setCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const results = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = posts.filter((post) => {
      const matchesCategory = category ? post.category === category : true;
      const matchesKeyword = keyword
        ? post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword)
        : true;
      return matchesCategory && matchesKeyword;
    });

    return [...filtered].sort((a, b) =>
      sort === "popular" ? b.viewCount - a.viewCount : b.date.localeCompare(a.date)
    );
  }, [posts, category, search, sort]);

  function resetFilters() {
    setCategory("");
    setSearch("");
    setSort("newest");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${chipClass(!category)}`}
        >
          {t(locale, "community.categoryAll")}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${chipClass(category === c, c)}`}
          >
            {t(locale, `community.category.${c}`)}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(locale, "community.searchPlaceholder")}
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none sm:flex-1"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
        >
          <option value="newest">{t(locale, "community.sort.newest")}</option>
          <option value="popular">{t(locale, "community.sort.popular")}</option>
        </select>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((post) => (
            <CommunityPostCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-background-soft px-4 py-12 text-center">
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-muted" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M9 3.75V6h6V3.75M9 3.75h6M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.012 1.244h3.22a2.25 2.25 0 002.012-1.244l.256-.512a2.25 2.25 0 012.012-1.244h3.86" />
          </svg>
          <p className="text-sm font-medium text-ink">{t(locale, "community.emptyFiltered.title")}</p>
          <p className="text-sm text-body">{t(locale, "community.emptyFiltered.hint")}</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {t(locale, "community.emptyFiltered.reset")}
          </button>
        </div>
      )}
    </div>
  );
}

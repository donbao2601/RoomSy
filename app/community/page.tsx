import Link from "next/link";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { MOCK_COMMUNITY_POSTS, type CommunityCategory } from "@/lib/mock/community";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";

const CATEGORIES: CommunityCategory[] = ["guide", "warning", "roommate", "finance"];

export default function CommunityListPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const locale = getLocale();
  const category = searchParams.category ?? "";

  const posts = category
    ? MOCK_COMMUNITY_POSTS.filter((p) => p.category === category)
    : MOCK_COMMUNITY_POSTS;

  function tabHref(target?: CommunityCategory) {
    return target ? `/community?category=${target}` : "/community";
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-xl font-semibold text-ink">
          {t(locale, "community.pageTitle")}
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={tabHref()}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              !category
                ? "bg-primary text-white"
                : "bg-background-soft text-body hover:bg-white"
            }`}
          >
            {t(locale, "community.categoryAll")}
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={tabHref(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                category === c
                  ? "bg-primary text-white"
                  : "bg-background-soft text-body hover:bg-white"
              }`}
            >
              {t(locale, `community.category.${c}`)}
            </Link>
          ))}
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-body">{t(locale, "community.empty")}</p>
        )}
      </div>
    </main>
  );
}

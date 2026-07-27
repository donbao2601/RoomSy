import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { CommunityBottomNav } from "@/components/community/CommunityBottomNav";
import type { MockCommunityPost } from "@/lib/mock/community";
import { getLocale } from "@/lib/i18n/getLocale";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n/translate";
import type { CommunityPostWithAuthor } from "@/lib/types";

function accountHrefFor(role?: string) {
  if (role === "landlord") return "/dashboard/landlord";
  if (role === "admin") return "/admin";
  if (role === "tenant") return "/dashboard/tenant";
  return "/auth/login";
}

export default async function CommunityListPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const locale = getLocale();
  const user = await getCurrentUser();
  const category = searchParams.category ?? "";

  const supabase = createClient();
  const { data: rows } = await supabase
    .from("community_posts")
    .select("id, category, title, content, view_count, created_at, author:users(full_name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const posts: MockCommunityPost[] = ((rows ?? []) as unknown as CommunityPostWithAuthor[]).map(
    (row) => ({
      id: row.id,
      category: row.category ?? "guide",
      title: row.title,
      author: row.author?.full_name ?? "Người dùng ROOMSY",
      date: row.created_at.slice(0, 10),
      viewCount: row.view_count,
      content: row.content ?? "",
      comments: [],
    })
  );

  return (
    <main className="min-h-screen bg-background px-4 py-8 pb-20 md:pb-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="mb-6 text-xl font-semibold text-ink">
            {t(locale, "community.pageTitle")}
          </h1>
          <CommunityFeed posts={posts} locale={locale} initialCategory={category} />
        </div>
        <CommunitySidebar locale={locale} />
      </div>

      <CommunityBottomNav locale={locale} accountHref={accountHrefFor(user?.role)} />
    </main>
  );
}

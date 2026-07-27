import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/community/CommentSection";
import { getLocale } from "@/lib/i18n/getLocale";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n/translate";
import type { CommunityPostWithAuthor } from "@/lib/types";

export default async function CommunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const locale = getLocale();
  const supabase = createClient();
  const { data: row } = await supabase
    .from("community_posts")
    .select("id, category, title, content, view_count, created_at, author:users(full_name)")
    .eq("id", params.id)
    .eq("status", "approved")
    .single();

  if (!row) notFound();

  const typedRow = row as unknown as CommunityPostWithAuthor;
  const post = {
    id: typedRow.id,
    category: typedRow.category ?? "guide",
    title: typedRow.title,
    author: typedRow.author?.full_name ?? "Người dùng ROOMSY",
    date: typedRow.created_at.slice(0, 10),
    viewCount: typedRow.view_count,
    content: typedRow.content ?? "",
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/community" className="mb-4 inline-block text-sm text-primary">
          ← {t(locale, "community.backToList")}
        </Link>

        <div className="rounded-xl bg-background-soft p-5 shadow-sm sm:p-6">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {t(locale, `community.category.${post.category}`)}
          </span>
          <h1 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
            {post.title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>
              {post.viewCount} {t(locale, "community.views")}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-body">
            {post.content}
          </p>

          <div className="mt-6 border-t border-line pt-5">
            <CommentSection initialComments={[]} />
          </div>
        </div>
      </div>
    </main>
  );
}

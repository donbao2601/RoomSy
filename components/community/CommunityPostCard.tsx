import Link from "next/link";
import type { MockCommunityPost } from "@/lib/mock/community";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

export function CommunityPostCard({
  post,
  locale = "vi",
}: {
  post: MockCommunityPost;
  locale?: Locale;
}) {
  return (
    <Link
      href={`/community/${post.id}`}
      className="block rounded-xl bg-background-soft p-4 shadow-sm transition hover:shadow-md"
    >
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {t(locale, `community.category.${post.category}`)}
      </span>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-ink">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-body">{post.content}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{post.author}</span>
        <span>
          {post.viewCount} {t(locale, "community.views")}
        </span>
      </div>
    </Link>
  );
}

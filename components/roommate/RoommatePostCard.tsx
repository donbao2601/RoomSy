import Link from "next/link";
import type { RoommatePostWithAuthor } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { GENDER_OPTIONS } from "@/lib/constants";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

export function RoommatePostCard({
  post,
  locale = "vi",
}: {
  post: RoommatePostWithAuthor;
  locale?: Locale;
}) {
  const genderLabel = GENDER_OPTIONS.find((g) => g.value === post.gender)?.label;

  return (
    <Link
      href={`/roommate/${post.id}`}
      className="block rounded-xl bg-background-soft p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {post.author?.full_name ?? t(locale, "roommate.postedBy")}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {post.district || "—"}
          </p>
        </div>
        <p className="whitespace-nowrap text-sm font-bold text-primary">
          {formatPrice(post.budget)}
        </p>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-body">{post.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {genderLabel && (
          <span className="rounded-full bg-background px-2 py-0.5 text-xs text-body">
            {genderLabel}
          </span>
        )}
        {post.age && (
          <span className="rounded-full bg-background px-2 py-0.5 text-xs text-body">
            {post.age} {t(locale, "roommate.age").toLowerCase()}
          </span>
        )}
        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-body">
          {post.has_pet ? t(locale, "roommate.hasPet") : t(locale, "roommate.noPet")}
        </span>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-body">
          {post.smoking ? t(locale, "roommate.smoking") : t(locale, "roommate.noSmoking")}
        </span>
      </div>
    </Link>
  );
}

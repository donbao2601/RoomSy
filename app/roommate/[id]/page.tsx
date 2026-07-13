import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactButton } from "@/components/listings/ContactButton";
import { formatPrice } from "@/lib/format";
import { GENDER_OPTIONS, ROOMMATE_LIFESTYLE_TAGS } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import type { RoommatePostWithAuthor } from "@/lib/types";

export default async function RoommateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const locale = getLocale();

  const { data } = await supabase
    .from("roommate_posts")
    .select("*, author:users(full_name, phone, avatar_url)")
    .eq("id", params.id)
    .single();

  const post = data as unknown as RoommatePostWithAuthor | null;

  if (!post || post.status !== "active") {
    notFound();
  }

  const genderLabel = GENDER_OPTIONS.find((g) => g.value === post.gender)?.label;
  const lifestyleLabels = post.lifestyle_tags
    ?.map((v) => ROOMMATE_LIFESTYLE_TAGS.find((l) => l.value === v)?.label ?? v)
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-xl bg-background-soft p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {t(
                locale,
                post.type === "find_room"
                  ? "roommate.tabFindRoom"
                  : "roommate.tabFindPerson"
              )}
            </span>
            <h1 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
              {post.district || t(locale, "roommate.pageTitle")}
            </h1>
          </div>
          <p className="whitespace-nowrap text-lg font-bold text-primary sm:text-xl">
            {formatPrice(post.budget)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-body">
          {genderLabel && (
            <span>
              {t(locale, "roommate.filterGender")}: {genderLabel}
            </span>
          )}
          {post.age && (
            <span>
              {t(locale, "roommate.age")}: {post.age}
            </span>
          )}
          {post.occupation && (
            <span>
              {t(locale, "roommate.occupation")}: {post.occupation}
            </span>
          )}
        </div>

        {post.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-body">
            {post.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-body">
          <span className="rounded-full bg-background px-3 py-1 text-xs">
            {post.has_pet ? t(locale, "roommate.hasPet") : t(locale, "roommate.noPet")}
          </span>
          <span className="rounded-full bg-background px-3 py-1 text-xs">
            {post.smoking ? t(locale, "roommate.smoking") : t(locale, "roommate.noSmoking")}
          </span>
        </div>

        {!!lifestyleLabels?.length && (
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-ink">
              {t(locale, "roommate.lifestyleTitle")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {lifestyleLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-background px-3 py-1 text-xs text-body"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <ContactButton phone={post.author?.phone ?? null} />
          {post.author?.full_name && (
            <span className="text-sm text-muted">
              {t(locale, "roommate.postedBy")}: {post.author.full_name}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

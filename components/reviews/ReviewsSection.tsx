import { createClient } from "@/lib/supabase/server";
import { RatingStars } from "@/components/reviews/RatingStars";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { REVIEW_CRITERIA } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import type { Review, ReviewWithReviewer } from "@/lib/types";

export async function ReviewsSection({
  listingId,
  revieweeId,
  currentUserId,
}: {
  listingId: string;
  revieweeId: string;
  currentUserId: string | null;
}) {
  const locale = getLocale();
  const supabase = createClient();

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  const rawReviews = (reviewRows as Review[]) ?? [];

  // reviews có 2 FK tới users (reviewer_id, reviewee_id) nên join ngầm của
  // PostgREST bị ambiguous — tự query rời rồi ghép trong JS cho chắc chắn,
  // thay vì đoán tên constraint FK tự sinh.
  const reviewerIds = Array.from(new Set(rawReviews.map((r) => r.reviewer_id)));
  const { data: reviewerRows } = reviewerIds.length
    ? await supabase
        .from("users")
        .select("id, full_name, avatar_url")
        .in("id", reviewerIds)
    : { data: [] as { id: string; full_name: string | null; avatar_url: string | null }[] };

  const reviewers = new Map((reviewerRows ?? []).map((u) => [u.id, u]));
  const reviews: ReviewWithReviewer[] = rawReviews.map((r) => ({
    ...r,
    reviewer: reviewers.get(r.reviewer_id) ?? null,
  }));
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mt-6 border-t border-line pt-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-ink">{t(locale, "review.title")}</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-1 text-sm text-body">
            <RatingStars rating={average} />
            {average.toFixed(1)}/5 ({reviews.length} {t(locale, "review.summary")})
          </span>
        )}
      </div>

      <p className="mb-4 text-xs text-muted">{t(locale, "review.prototypeNote")}</p>

      {currentUserId && currentUserId !== revieweeId && (
        <div className="mb-5">
          <ReviewForm
            reviewerId={currentUserId}
            revieweeId={revieweeId}
            listingId={listingId}
          />
        </div>
      )}
      {currentUserId && currentUserId === revieweeId && (
        <p className="mb-5 text-sm text-muted">{t(locale, "review.formSelfError")}</p>
      )}
      {!currentUserId && (
        <p className="mb-5 text-sm text-muted">{t(locale, "review.loginRequired")}</p>
      )}

      {reviews.length > 0 ? (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">
                  {review.reviewer?.full_name ?? "—"}
                </span>
                <RatingStars rating={review.rating} />
              </div>
              {!!review.criteria?.length && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {review.criteria.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-white px-2 py-0.5 text-xs text-body"
                    >
                      {t(locale, `review.criteria.${c}`) ||
                        REVIEW_CRITERIA.find((rc) => rc.value === c)?.label ||
                        c}
                    </span>
                  ))}
                </div>
              )}
              {review.comment && (
                <p className="mt-1.5 text-sm text-body">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-body">{t(locale, "review.noReviews")}</p>
      )}
    </div>
  );
}

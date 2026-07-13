"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { REVIEW_CRITERIA } from "@/lib/constants";

/**
 * Prototype (GĐ4 Nhóm 2): ghi thật vào bảng `reviews` nhưng KHÔNG kiểm tra
 * "đã tương tác" (đã thuê/đã liên hệ) — chỉ chặn tự đánh giá chính mình ở
 * trang gọi component này (page kiểm tra reviewerId !== revieweeId trước khi
 * render form).
 */
export function ReviewForm({
  reviewerId,
  revieweeId,
  listingId,
}: {
  reviewerId: string;
  revieweeId: string;
  listingId: string | null;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggleCriteria(value: string) {
    setCriteria((c) => (c.includes(value) ? c.filter((v) => v !== value) : [...c, value]));
  }

  async function handleSubmit() {
    if (rating < 1) {
      setError(t("review.formRatingRequired"));
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { error: insertError } = await supabase.from("reviews").insert({
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        listing_id: listingId,
        rating,
        criteria,
        comment: comment.trim() || null,
      });
      if (insertError) throw insertError;

      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  if (done) return null;

  return (
    <div className="rounded-xl bg-background p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink">{t("review.formTitle")}</h3>

      <div className="mb-3">
        <span className="mb-1 block text-sm font-medium text-body">
          {t("review.formRating")}
        </span>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={
                star <= (hoverRating || rating) ? "text-gold" : "text-neutral-300"
              }
              aria-label={`${star} sao`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <fieldset className="mb-3">
        <legend className="mb-1 text-sm font-medium text-body">
          {t("review.formCriteria")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {REVIEW_CRITERIA.map((c) => (
            <label
              key={c.value}
              className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs text-body"
            >
              <input
                type="checkbox"
                checked={criteria.includes(c.value)}
                onChange={() => toggleCriteria(c.value)}
              />
              {t(`review.criteria.${c.value}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mb-3 block">
        <span className="mb-1 block text-sm font-medium text-body">
          {t("review.formComment")}
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="input"
        />
      </label>

      {error && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? t("review.formSaving") : t("review.formSubmit")}
      </button>
    </div>
  );
}

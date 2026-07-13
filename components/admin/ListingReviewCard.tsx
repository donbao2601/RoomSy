"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/common/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LISTING_REVIEW_CRITERIA } from "@/lib/constants";
import { formatArea, formatPrice, typeLabel } from "@/lib/format";
import type { Locale } from "@/lib/i18n/locale";
import type { Listing } from "@/lib/types";

type ListingWithOwner = Listing & {
  owner: { full_name: string | null; phone: string | null; email: string } | null;
};

export function ListingReviewCard({
  listing,
  locale,
}: {
  listing: ListingWithOwner;
  locale: Locale;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const location = [listing.address, listing.district, listing.city]
    .filter(Boolean)
    .join(", ");

  function toggleCriterion(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleApprove() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("listings")
        .update({ status: "active" })
        .eq("id", listing.id);
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("listings")
        .update({ status: "rejected", reject_reason: reason || null })
        .eq("id", listing.id);
      setRejectOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl bg-background-soft p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          {listing.images?.[0] && (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-primary">
            {typeLabel(locale, listing.type)}
          </p>
          <h2 className="truncate text-sm font-semibold text-ink">
            {listing.title}
          </h2>
          <p className="text-sm font-bold text-primary">
            {formatPrice(listing.price)}
          </p>
          <p className="truncate text-xs text-body">
            {formatArea(listing.area)}
            {listing.area && location ? " · " : ""}
            {location}
          </p>
          {listing.owner && (
            <p className="mt-1 text-xs text-muted">
              {t("admin.pending.postedBy")}: {listing.owner.full_name ?? listing.owner.email}
              {listing.owner.phone ? ` · ${listing.owner.phone}` : ""}
            </p>
          )}
        </div>
      </div>

      {listing.description && (
        <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-body">
          {listing.description}
        </p>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 text-xs font-semibold text-ink">
          {t("admin.pending.checklistTitle")}
        </p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {LISTING_REVIEW_CRITERIA.map((key) => (
            <label
              key={key}
              className="flex items-center gap-2 text-xs text-body"
            >
              <input
                type="checkbox"
                checked={!!checked[key]}
                onChange={() => toggleCriterion(key)}
              />
              {t(key)}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setRejectOpen(true)}
          disabled={isPending}
          className="rounded-lg border border-error px-3 py-1.5 text-sm font-semibold text-error hover:bg-error/10 disabled:opacity-50"
        >
          {t("admin.pending.reject")}
        </button>
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {t("admin.pending.approve")}
        </button>
      </div>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={t("admin.pending.rejectTitle")}
      >
        <label className="mb-1 block text-sm font-medium text-body">
          {t("admin.pending.rejectReasonLabel")}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("admin.pending.rejectReasonPlaceholder")}
          rows={3}
          className="input"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setRejectOpen(false)}
            className="rounded-lg px-3 py-1.5 text-sm text-body hover:bg-background"
          >
            {t("vip.cancel")}
          </button>
          <button
            onClick={handleReject}
            disabled={isPending}
            className="rounded-lg bg-error px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? t("vip.processing") : t("admin.pending.rejectConfirm")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

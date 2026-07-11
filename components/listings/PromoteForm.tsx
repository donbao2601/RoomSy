"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/Modal";
import { PromotionBadge } from "@/components/listings/PromotionBadge";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PROMOTION_TIERS } from "@/lib/constants";

type TierValue = "C" | "B" | "HOT_A";

export function PromoteForm({
  listingId,
  quotaRemaining,
}: {
  listingId: string;
  quotaRemaining: Record<TierValue, number>;
}) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [selected, setSelected] = useState<TierValue | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedInfo = PROMOTION_TIERS.find((p) => p.value === selected);

  function handleConfirm() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/listings/${listingId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {PROMOTION_TIERS.map((tier) => {
          const value = tier.value as TierValue;
          const remaining = quotaRemaining[value] ?? 0;
          return (
            <button
              key={tier.value}
              onClick={() => {
                setSelected(value);
                setSuccess(false);
              }}
              className={`rounded-xl border p-4 text-left transition ${
                selected === value
                  ? "border-primary bg-primary/5"
                  : "border-line bg-white hover:border-primary/50"
              }`}
            >
              <PromotionBadge tier={value} locale={locale} />
              <p className="mt-2 text-sm font-semibold text-ink">{tier.label}</p>
              <p className="text-sm text-body">
                {tier.price.toLocaleString("vi-VN")}đ
              </p>
              {remaining > 0 && (
                <p className="mt-1 text-xs text-primary">
                  {remaining} {t("promote.quotaRemaining")}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted">{t("promote.duration")}</p>

      {selected && (
        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {t("promote.confirm")}
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="mt-2 text-sm font-medium text-primary">
          {t("promote.success")}
        </p>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("promote.confirmTitle")}
      >
        {selectedInfo && (
          <>
            <p className="text-sm text-body">
              {selectedInfo.label} — {selectedInfo.price.toLocaleString("vi-VN")}đ
            </p>
            <p className="mt-1 text-xs text-muted">
              💳 MoMo / VNPay / ZaloPay (mock)
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-body hover:bg-background"
              >
                {t("vip.cancel")}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? t("vip.processing") : t("promote.mockPay")}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

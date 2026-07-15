"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/Modal";
import { PromotionBadge } from "@/components/listings/PromotionBadge";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PROMOTION_TIERS, MOCK_BANK_INFO, MOCK_PAYMENT_WAIT_MS } from "@/lib/constants";

type TierValue = "C" | "B" | "HOT_A";

/** Tin B/HOT A đi qua bước thanh toán mock; Tin C giữ nguyên miễn phí. */
function requiresPayment(tier: TierValue) {
  return tier === "B" || tier === "HOT_A";
}

/** Ảnh QR placeholder chung (SVG tĩnh) — không sinh theo giao dịch. */
function MockQrPlaceholder() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-28 w-28 shrink-0 rounded-lg border border-line bg-white p-2"
      aria-hidden="true"
    >
      <rect width="100" height="100" fill="white" />
      {[
        [4, 4], [4, 16], [4, 28], [16, 4], [28, 4], [16, 28], [28, 16],
        [72, 4], [72, 16], [72, 28], [84, 4], [84, 28],
        [4, 72], [4, 84], [16, 72], [16, 84], [28, 84],
        [44, 8], [52, 20], [44, 44], [60, 44], [44, 60], [60, 60], [72, 52],
        [80, 44], [44, 80], [60, 80], [80, 68], [80, 80],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="#1A2410" />
      ))}
    </svg>
  );
}

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
  const [paymentStep, setPaymentStep] = useState<"closed" | "form" | "waiting">("closed");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submittedRef = useRef(false);

  const selectedInfo = PROMOTION_TIERS.find((p) => p.value === selected);

  function submitPromotion(onDone: () => void) {
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
        onDone();
        return;
      }
      onDone();
      setSuccess(true);
      router.refresh();
    });
  }

  function handleStartConfirm() {
    if (!selected) return;
    if (requiresPayment(selected)) {
      submittedRef.current = false;
      setPaymentStep("form");
    } else {
      setConfirmOpen(true);
    }
  }

  function handleTransferConfirmed() {
    submittedRef.current = false;
    setPaymentStep("waiting");
  }

  function finalizePayment() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitPromotion(() => setPaymentStep("closed"));
  }

  useEffect(() => {
    if (paymentStep !== "waiting") return;
    const timer = setTimeout(finalizePayment, MOCK_PAYMENT_WAIT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStep]);

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
          onClick={handleStartConfirm}
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

      {/* Tin C — giữ nguyên modal xác nhận miễn phí như cũ */}
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
                onClick={() => submitPromotion(() => setConfirmOpen(false))}
                disabled={isPending}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? t("vip.processing") : t("promote.mockPay")}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Tin B/HOT A — luồng thanh toán mock: QR + STK -> "đã chuyển khoản" -> đang xác nhận -> gọi API promote */}
      <Modal
        open={paymentStep !== "closed"}
        onClose={() => setPaymentStep("closed")}
        title={t("promote.paymentTitle")}
      >
        {selectedInfo && paymentStep === "form" && (
          <>
            <p className="text-sm text-body">
              {t("promote.paymentAmountLabel")}:{" "}
              <span className="font-semibold text-primary">
                {selectedInfo.price.toLocaleString("vi-VN")}đ
              </span>{" "}
              — {selectedInfo.label}
            </p>

            <div className="mt-3 flex items-start gap-3">
              <MockQrPlaceholder />
              <div className="flex-1 space-y-1 text-xs text-body">
                <p className="mb-1.5 text-[11px] text-muted">{t("promote.qrNote")}</p>
                <p>
                  <span className="text-muted">{t("promote.bankLabel")}: </span>
                  {MOCK_BANK_INFO.bank}
                </p>
                <p>
                  <span className="text-muted">{t("promote.accountNameLabel")}: </span>
                  {MOCK_BANK_INFO.accountName}
                </p>
                <p>
                  <span className="text-muted">{t("promote.accountNumberLabel")}: </span>
                  {MOCK_BANK_INFO.accountNumber}
                </p>
                <p>
                  <span className="text-muted">{t("promote.transferContentLabel")}: </span>
                  ROOMSY-{listingId.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-muted">
              * {t("promote.mockPaymentNote")}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPaymentStep("closed")}
                className="rounded-lg px-3 py-1.5 text-sm text-body hover:bg-background"
              >
                {t("vip.cancel")}
              </button>
              <button
                onClick={handleTransferConfirmed}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
              >
                {t("promote.confirmedTransfer")}
              </button>
            </div>
          </>
        )}

        {paymentStep === "waiting" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-ink">
              {t("promote.confirmingPayment")}
            </p>
            <button
              onClick={finalizePayment}
              disabled={isPending}
              className="mt-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            >
              {t("promote.skipWait")}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

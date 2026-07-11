"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/Modal";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function VipUpgradeButton({
  tier,
  label,
  price,
  isCurrent,
  isLoggedIn,
}: {
  tier: string;
  label: string;
  price: number;
  isCurrent: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isCurrent) {
    return (
      <span className="block w-full rounded-lg bg-background px-4 py-2 text-center text-sm font-semibold text-primary">
        {t("vip.currentPlan")}
      </span>
    );
  }

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/vip`);
      return;
    }
    setOpen(true);
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/vip/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        {t("vip.upgrade")}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("vip.confirmTitle")}
      >
        <p className="text-sm text-body">
          {t("vip.confirmBody")} <strong>{label}</strong> —{" "}
          {price.toLocaleString("vi-VN")}đ
        </p>
        <p className="mt-1 text-xs text-muted">
          💳 MoMo / VNPay / ZaloPay (mock)
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-1.5 text-sm text-body hover:bg-background"
          >
            {t("vip.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? t("vip.processing") : t("vip.confirmButton")}
          </button>
        </div>
      </Modal>
    </>
  );
}

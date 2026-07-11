"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { BOOST_COOLDOWN_MINUTES } from "@/lib/constants";

export function BoostButton({
  listingId,
  lastPushedAt,
}: {
  listingId: string;
  lastPushedAt: string | null;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!lastPushedAt) return;
    const interval = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(interval);
  }, [lastPushedAt]);

  const cooldownMs = BOOST_COOLDOWN_MINUTES * 60 * 1000;
  const elapsed = lastPushedAt
    ? Date.now() - new Date(lastPushedAt).getTime()
    : Infinity;
  const onCooldown = elapsed < cooldownMs;
  const remainingMinutes = Math.ceil((cooldownMs - elapsed) / 60000);

  function handleBoost() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/listings/${listingId}/boost`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
        return;
      }
      router.refresh();
    });
  }

  if (onCooldown) {
    return (
      <span className="text-xs font-medium text-muted">
        {t("manage.boostWait")} {remainingMinutes} {t("manage.boostWaitSuffix")}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleBoost}
        disabled={isPending}
        className="text-xs font-semibold text-primary hover:text-primary-dark disabled:opacity-50"
      >
        {isPending ? t("manage.boosting") : t("manage.boost")}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

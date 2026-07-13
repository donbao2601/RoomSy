"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function ReportRowActions({
  reportId,
  severity,
  status,
  targetType,
  targetId,
  listingOwnerId,
}: {
  reportId: string;
  severity: "low" | "medium" | "high";
  status: string;
  targetType: "user" | "listing";
  targetId: string;
  listingOwnerId: string | null;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  function handleResolve() {
    if (!confirm(t("admin.reports.actionConfirm"))) return;

    startTransition(async () => {
      const supabase = createClient();

      // Tái sử dụng đúng mutation đã có từ A1 (users.status) / A2 (listings.status).
      if (severity === "low" && targetType === "listing") {
        await supabase.from("listings").update({ status: "hidden" }).eq("id", targetId);
      } else if (severity === "medium" && targetType === "listing") {
        await supabase.from("listings").update({ status: "hidden" }).eq("id", targetId);
        if (listingOwnerId) {
          await supabase.from("users").update({ status: "banned" }).eq("id", listingOwnerId);
        }
      } else if (severity === "high") {
        const userId = targetType === "user" ? targetId : listingOwnerId;
        if (userId) {
          await supabase.from("users").update({ status: "banned" }).eq("id", userId);
        }
      }

      await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
      router.refresh();
    });
  }

  if (status === "resolved") {
    return (
      <span className="text-xs text-muted">
        {t("admin.reports.statusResolved")}
      </span>
    );
  }

  const label =
    severity === "low"
      ? t("admin.reports.actionWarnHide")
      : severity === "medium"
        ? t("admin.reports.actionLockBoth")
        : t("admin.reports.actionBanPermanent");

  return (
    <button
      onClick={handleResolve}
      disabled={isPending}
      className="rounded-lg border border-error px-3 py-1.5 text-xs font-semibold text-error hover:bg-error/10 disabled:opacity-50"
    >
      {label}
    </button>
  );
}

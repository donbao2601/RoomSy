"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function AdminUserRowActions({
  userId,
  status,
  verifiedBadge,
}: {
  userId: string;
  status: "active" | "banned";
  verifiedBadge: boolean;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  function handleToggleLock() {
    const confirmMsg =
      status === "banned"
        ? t("admin.users.unlockConfirm")
        : t("admin.users.lockConfirm");
    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("users")
        .update({ status: status === "banned" ? "active" : "banned" })
        .eq("id", userId);
      router.refresh();
    });
  }

  function handleToggleVerified() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("users")
        .update({ verified_badge: !verifiedBadge })
        .eq("id", userId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        onClick={handleToggleLock}
        disabled={isPending}
        className={`font-semibold disabled:opacity-50 ${
          status === "banned"
            ? "text-primary hover:text-primary-dark"
            : "text-error hover:opacity-80"
        }`}
      >
        {t(status === "banned" ? "admin.users.unlock" : "admin.users.lock")}
      </button>
      <button
        onClick={handleToggleVerified}
        disabled={isPending}
        className="font-semibold text-info hover:opacity-80 disabled:opacity-50"
      >
        {t(verifiedBadge ? "admin.users.unverify" : "admin.users.verify")}
      </button>
    </div>
  );
}

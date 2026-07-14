"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function RoommatePostRowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(t("roommate.deleteConfirm"))) return;
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("roommate_posts")
        .delete()
        .eq("id", id);
      if (deleteError) {
        setError(t("common.error"));
        return;
      }
      router.refresh();
    });
  }

  function handleToggleHidden() {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("roommate_posts")
        .update({ status: status === "hidden" ? "active" : "hidden" })
        .eq("id", id);
      if (updateError) {
        setError(t("common.error"));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1 text-sm">
      <div className="flex items-center gap-3">
        <Link href={`/roommate/${id}/edit`} className="font-medium text-primary">
          {t("manage.edit")}
        </Link>
        <button
          onClick={handleToggleHidden}
          disabled={isPending}
          className="font-medium text-body hover:text-ink disabled:opacity-50"
        >
          {status === "hidden" ? t("manage.show") : t("manage.hide")}
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {t("manage.delete")}
        </button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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

  function handleDelete() {
    if (!confirm(t("roommate.deleteConfirm"))) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("roommate_posts").delete().eq("id", id);
      router.refresh();
    });
  }

  function handleToggleHidden() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("roommate_posts")
        .update({ status: status === "hidden" ? "active" : "hidden" })
        .eq("id", id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3 text-sm">
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
  );
}

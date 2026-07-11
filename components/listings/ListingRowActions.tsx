"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { BoostButton } from "@/components/listings/BoostButton";
import type { Listing } from "@/lib/types";

export function ListingRowActions({
  id,
  status,
  expiresAt,
  lastPushedAt,
}: {
  id: string;
  status: Listing["status"];
  expiresAt: string;
  lastPushedAt: string | null;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const notExpired = new Date(expiresAt).getTime() > Date.now();

  function handleDelete() {
    if (!confirm(t("manage.deleteConfirm"))) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("listings").delete().eq("id", id);
      router.refresh();
    });
  }

  function handleToggleHidden() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("listings")
        .update({ status: status === "hidden" ? "active" : "hidden" })
        .eq("id", id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5 text-sm">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/landlord/listings/${id}/edit`}
          className="font-medium text-primary"
        >
          {t("manage.edit")}
        </Link>
        {(status === "active" || status === "hidden") && (
          <button
            onClick={handleToggleHidden}
            disabled={isPending}
            className="font-medium text-body hover:text-ink disabled:opacity-50"
          >
            {status === "hidden" ? t("manage.show") : t("manage.hide")}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {t("manage.delete")}
        </button>
      </div>

      {status === "active" && notExpired && (
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/landlord/listings/${id}/promote`}
            className="text-xs font-medium text-gold"
          >
            {t("manage.promote")}
          </Link>
          <BoostButton listingId={id} lastPushedAt={lastPushedAt} />
        </div>
      )}
    </div>
  );
}

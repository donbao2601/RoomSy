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
    <div className="flex flex-col items-stretch gap-2 text-sm sm:items-end">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          href={`/dashboard/landlord/listings/${id}/edit`}
          className="rounded-md py-1.5 font-medium text-primary"
        >
          {t("manage.edit")}
        </Link>
        {(status === "active" || status === "hidden") && (
          <button
            onClick={handleToggleHidden}
            disabled={isPending}
            className="rounded-md py-1.5 font-medium text-body hover:text-ink disabled:opacity-50"
          >
            {status === "hidden" ? t("manage.show") : t("manage.hide")}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-md py-1.5 font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {t("manage.delete")}
        </button>
      </div>

      {status === "active" && notExpired && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-2 sm:border-t-0 sm:pt-0">
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

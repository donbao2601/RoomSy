"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types";

export function ListingRowActions({
  id,
  status,
}: {
  id: string;
  status: Listing["status"];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Xoá tin đăng này? Hành động không thể hoàn tác.")) return;
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
    <div className="flex items-center gap-3 text-sm">
      <Link
        href={`/dashboard/landlord/listings/${id}/edit`}
        className="font-medium text-primary"
      >
        Sửa
      </Link>
      {(status === "active" || status === "hidden") && (
        <button
          onClick={handleToggleHidden}
          disabled={isPending}
          className="font-medium text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
        >
          {status === "hidden" ? "Hiển thị lại" : "Tạm ẩn"}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        Xoá
      </button>
    </div>
  );
}

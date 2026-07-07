"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function FavoriteButton({
  listingId,
  userId,
  initialFavorited,
}: {
  listingId: string;
  userId: string | null;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!userId) {
      router.push(`/auth/login?redirect=/listings/${listingId}`);
      return;
    }

    startTransition(async () => {
      const supabase = createClient();

      if (favorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId);
        setFavorited(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: userId, listing_id: listingId });
        setFavorited(true);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        favorited
          ? "border-primary bg-primary/10 text-primary"
          : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {favorited ? "★ Đã lưu" : "☆ Lưu yêu thích"}
    </button>
  );
}

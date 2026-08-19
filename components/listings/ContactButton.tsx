"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function ContactButton({
  phone,
  listingId,
  isAuthenticated = true,
}: {
  phone: string | null;
  listingId?: string;
  isAuthenticated?: boolean;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);

  if (!phone) return null;

  function handleClick() {
    if (!isAuthenticated && listingId) {
      router.push(`/auth/login?redirect=/listings/${listingId}`);
      return;
    }
    setRevealed(true);
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      {revealed ? `📞 ${phone}` : t("listing.contact")}
    </button>
  );
}

"use client";

import { useState } from "react";

export function ContactButton({ phone }: { phone: string | null }) {
  const [revealed, setRevealed] = useState(false);

  if (!phone) return null;

  return (
    <button
      onClick={() => setRevealed(true)}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      {revealed ? `📞 ${phone}` : "Liên hệ ngay"}
    </button>
  );
}

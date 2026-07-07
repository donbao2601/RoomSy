"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-xl gap-2"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo khu vực, tên phòng..."
        className="input"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        Tìm kiếm
      </button>
    </form>
  );
}

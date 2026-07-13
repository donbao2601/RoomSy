"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { MockComment } from "@/lib/mock/community";

/**
 * Prototype (GĐ4 Nhóm 3): bình luận chỉ append vào state cục bộ của trình
 * duyệt, KHÔNG ghi vào community_comments hay bất kỳ bảng nào — mất khi tải
 * lại trang. Đúng tinh thần "mock data tĩnh" đã thống nhất cho nhóm này.
 */
export function CommentSection({ initialComments }: { initialComments: MockComment[] }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");

  function handleSubmit() {
    if (!draft.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `local-${prev.length}-${draft.length}`,
        author: t("community.commentYou"),
        content: draft.trim(),
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
    setDraft("");
  }

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-ink">
        {t("community.commentsTitle")}
      </h2>
      <p className="mb-3 text-xs text-muted">{t("community.commentPrototypeNote")}</p>

      {comments.length > 0 ? (
        <ul className="mb-4 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{c.author}</span>
                <span className="text-xs text-muted">{c.date}</span>
              </div>
              <p className="mt-1 text-sm text-body">{c.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-body">{t("community.commentsEmpty")}</p>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={t("community.commentPlaceholder")}
          className="input"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {t("community.commentSubmit")}
        </button>
      </div>
    </div>
  );
}

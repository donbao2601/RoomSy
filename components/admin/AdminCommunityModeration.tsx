"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { MockCommunityPost } from "@/lib/mock/community";

/**
 * Prototype (rebuild): trạng thái duyệt chỉ tồn tại trong state cục bộ của
 * trình duyệt, KHÔNG ghi vào Supabase — mất khi tải lại trang.
 */
type ModerationStatus = "pending" | "approved" | "hidden" | "rejected";

const POST_STATUS_STYLE: Record<ModerationStatus, string> = {
  pending: "bg-info-bg text-info",
  approved: "bg-primary/10 text-primary",
  hidden: "bg-warning-bg text-warning",
  rejected: "bg-error/10 text-error",
};

const POST_STATUS_LABEL_KEY: Record<ModerationStatus, string> = {
  pending: "admin.community.statusPending",
  approved: "admin.community.statusApproved",
  hidden: "admin.community.statusHidden",
  rejected: "admin.community.statusRejected",
};

export function AdminCommunityModeration({
  posts,
}: {
  posts: MockCommunityPost[];
}) {
  const { t } = useLanguage();
  const [statusMap, setStatusMap] = useState<Record<string, ModerationStatus>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  function updateStatus(postId: string, next: ModerationStatus) {
    if (next === "rejected" && !confirm(t("admin.community.rejectConfirm"))) return;
    setStatusMap((prev) => ({ ...prev, [postId]: next }));
    setToast(t("admin.community.toastDone"));
  }

  return (
    <div className="relative">
      <p className="mb-4 rounded-lg bg-info-bg px-3 py-2 text-xs text-info">
        {t("admin.community.prototypeNote")}
      </p>

      <div className="overflow-x-auto rounded-xl bg-background-soft shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th className="px-4 py-3 font-medium">{t("admin.community.colPost")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.community.colCategory")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.community.colDate")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.community.colStatus")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.community.colAction")}</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const status = statusMap[post.id] ?? "approved";
              return (
                <tr key={post.id} className="border-b border-line last:border-0">
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-medium text-ink">{post.title}</p>
                    <p className="text-xs text-muted">{post.author}</p>
                  </td>
                  <td className="px-4 py-3 text-body">
                    {t(`community.category.${post.category}`)}
                  </td>
                  <td className="px-4 py-3 text-body">{post.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${POST_STATUS_STYLE[status]}`}
                    >
                      {t(POST_STATUS_LABEL_KEY[status])}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => updateStatus(post.id, "approved")}
                        disabled={status === "approved"}
                        className="rounded-lg border border-line px-2 py-1 text-xs font-medium text-body hover:bg-background disabled:opacity-50"
                      >
                        {t("admin.community.approve")}
                      </button>
                      <button
                        onClick={() => updateStatus(post.id, "hidden")}
                        disabled={status === "hidden"}
                        className="rounded-lg border border-warning px-2 py-1 text-xs font-medium text-warning hover:bg-warning-bg disabled:opacity-50"
                      >
                        {t("admin.community.hide")}
                      </button>
                      <button
                        onClick={() => updateStatus(post.id, "rejected")}
                        disabled={status === "rejected"}
                        className="rounded-lg border border-error px-2 py-1 text-xs font-medium text-error hover:bg-error/10 disabled:opacity-50"
                      >
                        {t("admin.community.reject")}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

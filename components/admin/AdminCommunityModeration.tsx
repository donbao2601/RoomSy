"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { CommunityPostStatus, CommunityPostWithAuthor } from "@/lib/types";

const POST_STATUS_STYLE: Record<CommunityPostStatus, string> = {
  pending: "bg-info-bg text-info",
  approved: "bg-primary/10 text-primary",
  hidden: "bg-warning-bg text-warning",
  rejected: "bg-error/10 text-error",
};

const POST_STATUS_LABEL_KEY: Record<CommunityPostStatus, string> = {
  pending: "admin.community.statusPending",
  approved: "admin.community.statusApproved",
  hidden: "admin.community.statusHidden",
  rejected: "admin.community.statusRejected",
};

export function AdminCommunityModeration({
  posts,
}: {
  posts: CommunityPostWithAuthor[];
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  function updateStatus(postId: string, next: CommunityPostStatus) {
    if (next === "rejected" && !confirm(t("admin.community.rejectConfirm"))) return;

    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("community_posts").update({ status: next }).eq("id", postId);
      setToast(t("admin.community.toastDone"));
      router.refresh();
    });
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
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-line last:border-0">
                <td className="max-w-xs px-4 py-3">
                  <p className="truncate font-medium text-ink">{post.title}</p>
                  <p className="text-xs text-muted">
                    {post.author?.full_name ?? "Người dùng ROOMSY"}
                  </p>
                </td>
                <td className="px-4 py-3 text-body">
                  {t(`community.category.${post.category ?? "guide"}`)}
                </td>
                <td className="px-4 py-3 text-body">{post.created_at.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${POST_STATUS_STYLE[post.status]}`}
                  >
                    {t(POST_STATUS_LABEL_KEY[post.status])}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => updateStatus(post.id, "approved")}
                      disabled={isPending || post.status === "approved"}
                      className="rounded-lg border border-line px-2 py-1 text-xs font-medium text-body hover:bg-background disabled:opacity-50"
                    >
                      {t("admin.community.approve")}
                    </button>
                    <button
                      onClick={() => updateStatus(post.id, "hidden")}
                      disabled={isPending || post.status === "hidden"}
                      className="rounded-lg border border-warning px-2 py-1 text-xs font-medium text-warning hover:bg-warning-bg disabled:opacity-50"
                    >
                      {t("admin.community.hide")}
                    </button>
                    <button
                      onClick={() => updateStatus(post.id, "rejected")}
                      disabled={isPending || post.status === "rejected"}
                      className="rounded-lg border border-error px-2 py-1 text-xs font-medium text-error hover:bg-error/10 disabled:opacity-50"
                    >
                      {t("admin.community.reject")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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

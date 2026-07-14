"use client";

import { Fragment, useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { MockCommunityPost } from "@/lib/mock/community";

// Prototype (GĐ4 Nhóm 4): trạng thái duyệt chỉ tồn tại trong state cục bộ, không ghi DB.
type PostStatus = "active" | "hidden" | "removed";
type CommentStatus = "active" | "hidden" | "removed";

const POST_STATUS_STYLE: Record<PostStatus, string> = {
  active: "bg-primary/10 text-primary",
  hidden: "bg-warning-bg text-warning",
  removed: "bg-error/10 text-error",
};

const COMMENT_STATUS_STYLE: Record<CommentStatus, string> = {
  active: "bg-primary/10 text-primary",
  hidden: "bg-warning-bg text-warning",
  removed: "bg-error/10 text-error",
};

export function AdminCommunityModeration({
  posts,
}: {
  posts: MockCommunityPost[];
}) {
  const { t } = useLanguage();
  const [postStatus, setPostStatus] = useState<Record<string, PostStatus>>({});
  const [commentStatus, setCommentStatus] = useState<Record<string, CommentStatus>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  function notify() {
    setToast(t("admin.community.toastDone"));
  }

  function handlePostAction(postId: string, next: PostStatus) {
    if (next === "removed" && !confirm(t("admin.community.removeConfirm"))) return;
    setPostStatus((prev) => ({ ...prev, [postId]: next }));
    notify();
  }

  function handleCommentAction(commentId: string, next: CommentStatus) {
    if (next === "removed" && !confirm(t("admin.community.commentRemoveConfirm"))) return;
    setCommentStatus((prev) => ({ ...prev, [commentId]: next }));
    notify();
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
              <th className="px-4 py-3 font-medium">{t("admin.community.colComments")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.community.colStatus")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.community.colAction")}</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const status = postStatus[post.id] ?? "active";
              const expanded = expandedPostId === post.id;

              return (
                <Fragment key={post.id}>
                  <tr className="border-b border-line last:border-0">
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium text-ink">{post.title}</p>
                      <p className="text-xs text-muted">{post.author}</p>
                    </td>
                    <td className="px-4 py-3 text-body">
                      {t(`community.category.${post.category}`)}
                    </td>
                    <td className="px-4 py-3 text-body">{post.date}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedPostId(expanded ? null : post.id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {post.comments.length}{" "}
                        {expanded
                          ? t("admin.community.hideComments")
                          : t("admin.community.viewComments")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${POST_STATUS_STYLE[status]}`}
                      >
                        {t(`admin.community.status${status === "active" ? "Active" : status === "hidden" ? "Hidden" : "Removed"}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handlePostAction(post.id, "active")}
                          disabled={status === "removed"}
                          className="rounded-lg border border-line px-2 py-1 text-xs font-medium text-body hover:bg-background disabled:opacity-50"
                        >
                          {t("admin.community.approve")}
                        </button>
                        <button
                          onClick={() => handlePostAction(post.id, "hidden")}
                          disabled={status === "removed"}
                          className="rounded-lg border border-warning px-2 py-1 text-xs font-medium text-warning hover:bg-warning-bg disabled:opacity-50"
                        >
                          {t("admin.community.hide")}
                        </button>
                        <button
                          onClick={() => handlePostAction(post.id, "removed")}
                          disabled={status === "removed"}
                          className="rounded-lg border border-error px-2 py-1 text-xs font-medium text-error hover:bg-error/10 disabled:opacity-50"
                        >
                          {t("admin.community.remove")}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="border-b border-line bg-background last:border-0">
                      <td colSpan={6} className="px-4 py-3">
                        {post.comments.length > 0 ? (
                          <ul className="space-y-2">
                            {post.comments.map((c) => {
                              const cStatus = commentStatus[c.id] ?? "active";
                              return (
                                <li
                                  key={c.id}
                                  className="flex flex-col gap-2 rounded-lg bg-background-soft p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-ink">{c.author}</span>
                                      <span className="text-xs text-muted">{c.date}</span>
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${COMMENT_STATUS_STYLE[cStatus]}`}
                                      >
                                        {t(`admin.community.commentStatus${cStatus === "active" ? "Active" : cStatus === "hidden" ? "Hidden" : "Removed"}`)}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-xs text-body">{c.content}</p>
                                  </div>
                                  <div className="flex shrink-0 gap-1.5">
                                    <button
                                      onClick={() => handleCommentAction(c.id, "hidden")}
                                      disabled={cStatus === "removed"}
                                      className="rounded-lg border border-warning px-2 py-1 text-xs font-medium text-warning hover:bg-warning-bg disabled:opacity-50"
                                    >
                                      {t("admin.community.commentHide")}
                                    </button>
                                    <button
                                      onClick={() => handleCommentAction(c.id, "removed")}
                                      disabled={cStatus === "removed"}
                                      className="rounded-lg border border-error px-2 py-1 text-xs font-medium text-error hover:bg-error/10 disabled:opacity-50"
                                    >
                                      {t("admin.community.commentRemove")}
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-xs text-body">{t("admin.community.commentsEmpty")}</p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
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

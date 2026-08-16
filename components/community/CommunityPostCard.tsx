"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CommunityCategory, MockCommunityPost } from "@/lib/mock/community";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

const CATEGORY_TAG_CLASS: Record<CommunityCategory, string> = {
  qna: "bg-info/10 text-info",
  review: "bg-gold/10 text-gold",
  experience: "bg-primary/10 text-primary",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CommunityPostCard({
  post,
  locale = "vi",
}: {
  post: MockCommunityPost;
  locale?: Locale;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <Link
      href={`/community/${post.id}`}
      className="block rounded-xl bg-background-soft p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {getInitials(post.author)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{post.author}</p>
          <p className="text-xs text-muted">{post.timeAgo}</p>
        </div>
      </div>

      <span
        className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_TAG_CLASS[post.category]}`}
      >
        {t(locale, `community.category.${post.category}`)}
      </span>

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-ink">
        {post.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-body">{post.content}</p>

      {post.category === "review" && post.rating && (
        <p className="mt-2 text-sm font-medium text-gold">{post.rating.toFixed(1)} ⭐</p>
      )}

      {post.category === "review" && post.images && post.images.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-1">
          {post.images.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-md bg-line">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 30vw, 220px"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {post.comments.length}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSaved((s) => !s);
          }}
          className="flex items-center gap-1 text-body hover:text-primary"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          {t(locale, "community.save")}
        </button>
      </div>
    </Link>
  );
}

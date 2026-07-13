import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { RoommatePostRowActions } from "@/components/roommate/RoommatePostRowActions";
import { formatPrice, STATUS_COLORS, statusLabel } from "@/lib/format";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";
import type { RoommatePost } from "@/lib/types";

export default async function RoommateManagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const locale = getLocale();
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("roommate_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-ink">
            {t(locale, "roommate.manageTitle")}
          </h1>
          <Link
            href="/roommate/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {t(locale, "roommate.newPost")}
          </Link>
        </div>

        <div className="space-y-3">
          {posts && posts.length > 0 ? (
            (posts as RoommatePost[]).map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {post.district || "—"} ·{" "}
                    {t(
                      locale,
                      post.type === "find_room"
                        ? "roommate.tabFindRoom"
                        : "roommate.tabFindPerson"
                    )}
                  </p>
                  <p className="text-sm text-primary">{formatPrice(post.budget)}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[post.status] ?? "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {statusLabel(locale, post.status)}
                  </span>
                </div>

                <RoommatePostRowActions id={post.id} status={post.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-body">{t(locale, "roommate.manageEmpty")}</p>
          )}
        </div>
      </div>
    </main>
  );
}

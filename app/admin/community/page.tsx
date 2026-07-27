import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminCommunityModeration } from "@/components/admin/AdminCommunityModeration";
import { getLocale } from "@/lib/i18n/getLocale";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n/translate";
import type { CommunityPostWithAuthor } from "@/lib/types";

export default async function AdminCommunityPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const locale = getLocale();
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, category, title, content, view_count, status, created_at, author:users(full_name)")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <AdminNav locale={locale} />

        <h1 className="mb-4 text-xl font-semibold text-ink">
          {t(locale, "admin.community.title")}
        </h1>

        <AdminCommunityModeration posts={(posts ?? []) as unknown as CommunityPostWithAuthor[]} />
      </div>
    </main>
  );
}

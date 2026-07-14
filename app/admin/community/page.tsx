import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminCommunityModeration } from "@/components/admin/AdminCommunityModeration";
import { MOCK_COMMUNITY_POSTS } from "@/lib/mock/community";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";

export default async function AdminCommunityPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const locale = getLocale();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <AdminNav locale={locale} />

        <h1 className="mb-4 text-xl font-semibold text-ink">
          {t(locale, "admin.community.title")}
        </h1>

        <AdminCommunityModeration posts={MOCK_COMMUNITY_POSTS} />
      </div>
    </main>
  );
}

import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { CommunityBottomNav } from "@/components/community/CommunityBottomNav";
import { MOCK_COMMUNITY_POSTS } from "@/lib/mock/community";
import { getLocale } from "@/lib/i18n/getLocale";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { t } from "@/lib/i18n/translate";

function accountHrefFor(role?: string) {
  if (role === "landlord") return "/dashboard/landlord";
  if (role === "admin") return "/admin";
  if (role === "tenant") return "/dashboard/tenant";
  return "/auth/login";
}

export default async function CommunityListPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const locale = getLocale();
  const user = await getCurrentUser();
  const category = searchParams.category ?? "";

  return (
    <main className="min-h-screen bg-background px-4 py-8 pb-20 md:pb-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-6 rounded-xl bg-background-soft p-5 sm:p-6">
            <h1 className="text-xl font-semibold text-ink sm:text-2xl">
              {t(locale, "community.pageTitle")}
            </h1>
            <p className="mt-1 max-w-md text-sm text-body">
              {t(locale, "community.heroSubtitle")}
            </p>
          </div>

          <CommunityFeed posts={MOCK_COMMUNITY_POSTS} locale={locale} initialCategory={category} />
        </div>
        <CommunitySidebar locale={locale} />
      </div>

      <CommunityBottomNav locale={locale} accountHref={accountHrefFor(user?.role)} />
    </main>
  );
}

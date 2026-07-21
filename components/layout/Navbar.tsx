import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { MobileNav, type NavItem } from "@/components/layout/MobileNav";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

export async function Navbar({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();

  const items: NavItem[] = [
    { href: "/roommate", label: t(locale, "nav.roommate") },
    { href: "/community", label: t(locale, "nav.community") },
    { href: "/vip", label: t(locale, "nav.vip") },
  ];

  if (!user) {
    items.push(
      { href: "/auth/login", label: t(locale, "nav.login") },
      { href: "/auth/register", label: t(locale, "nav.register"), variant: "primary" }
    );
  }

  if (user?.role === "landlord") {
    items.push(
      { href: "/dashboard/landlord", label: t(locale, "nav.landlordOverview") },
      { href: "/dashboard/landlord/listings/new", label: t(locale, "nav.postListing") },
      { href: "/dashboard/landlord/listings", label: t(locale, "nav.manageListings") }
    );
  }

  if (user?.role === "admin") {
    items.push({ href: "/admin", label: t(locale, "nav.admin") });
  }

  if (user?.role === "tenant") {
    items.push({ href: "/dashboard/tenant", label: t(locale, "nav.tenantDashboard") });
  }

  return (
    <header className="relative z-30 h-16 border-b border-line bg-white md:fixed md:inset-x-0 md:top-0 md:h-[88px]">
      <div className="relative mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/roomsy-logo-full.png"
            alt="ROOMSY"
            width={279}
            height={176}
            priority
            className="hidden h-[68px] w-auto md:block"
          />
          <Image
            src="/roomsy-logo-wordmark.png"
            alt="ROOMSY"
            width={310}
            height={112}
            priority
            className="h-10 w-auto md:hidden"
          />
        </Link>

        <MobileNav
          items={items}
          showSignOut={!!user}
          menuOpenLabel={t(locale, "nav.menuOpen")}
          menuCloseLabel={t(locale, "nav.menuClose")}
        />
      </div>
    </header>
  );
}

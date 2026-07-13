import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

export async function Navbar({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-primary">
          ROOMSY
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/vip"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
          >
            {t(locale, "nav.vip")}
          </Link>

          {!user && (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
              >
                {t(locale, "nav.login")}
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                {t(locale, "nav.register")}
              </Link>
            </>
          )}

          {user?.role === "landlord" && (
            <>
              <Link
                href="/dashboard/landlord"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
              >
                {t(locale, "nav.landlordOverview")}
              </Link>
              <Link
                href="/dashboard/landlord/listings/new"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
              >
                {t(locale, "nav.postListing")}
              </Link>
              <Link
                href="/dashboard/landlord/listings"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
              >
                {t(locale, "nav.manageListings")}
              </Link>
              <SignOutButton />
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                href="/admin"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
              >
                {t(locale, "nav.admin")}
              </Link>
              <SignOutButton />
            </>
          )}

          {user?.role === "tenant" && <SignOutButton />}

          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}

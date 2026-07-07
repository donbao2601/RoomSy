import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { SignOutButton } from "@/components/layout/SignOutButton";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-primary">
          ROOMSY
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {!user && (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-background"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Đăng ký
              </Link>
            </>
          )}

          {user?.role === "landlord" && (
            <>
              <Link
                href="/dashboard/landlord/listings/new"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-background"
              >
                Đăng tin
              </Link>
              <Link
                href="/dashboard/landlord/listings"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-background"
              >
                Quản lý tin
              </Link>
              <SignOutButton />
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                href="/dashboard/admin"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-background"
              >
                Quản trị
              </Link>
              <SignOutButton />
            </>
          )}

          {user?.role === "tenant" && <SignOutButton />}
        </nav>
      </div>
    </header>
  );
}

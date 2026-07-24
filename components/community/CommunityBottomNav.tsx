import Link from "next/link";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

const ICON_PATHS: Record<string, string> = {
  home: "M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0L22.25 12M4.5 9.75V19.5a1.5 1.5 0 001.5 1.5h3.75v-6h4.5v6h3.75a1.5 1.5 0 001.5-1.5V9.75",
  rent: "M3.75 21h16.5M4.5 21V6.75a1.5 1.5 0 011.5-1.5h3v15.75m6-15.75h-3v15.75m3-15.75a1.5 1.5 0 011.5 1.5V21M9 9h.008v.008H9V9zm0 3.75h.008v.008H9v-.008zm3-3.75h.008v.008H12V9zm0 3.75h.008v.008H12v-.008z",
  roommate: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  community: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m5.625 0c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  account: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.964 0a9 9 0 10-11.964 0m11.964 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
};

type Item = {
  key: keyof typeof ICON_PATHS;
  href: string;
  label: string;
};

export function CommunityBottomNav({
  locale,
  accountHref,
}: {
  locale: Locale;
  accountHref: string;
}) {
  const items: Item[] = [
    { key: "home", href: "/", label: t(locale, "nav.home") },
    { key: "rent", href: "/search", label: t(locale, "nav.rent") },
    { key: "roommate", href: "/roommate", label: t(locale, "nav.roommate") },
    { key: "community", href: "/community", label: t(locale, "nav.community") },
    { key: "account", href: accountHref, label: t(locale, "nav.account") },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white md:hidden">
      {items.map((item) => {
        const active = item.key === "community";
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? "text-primary" : "text-muted"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[item.key]} />
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

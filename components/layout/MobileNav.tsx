"use client";

import Link from "next/link";
import { useState } from "react";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export type NavItem = {
  href: string;
  label: string;
  variant?: "primary";
};

export function MobileNav({
  items,
  showSignOut,
  menuOpenLabel,
  menuCloseLabel,
}: {
  items: NavItem[];
  showSignOut: boolean;
  menuOpenLabel: string;
  menuCloseLabel: string;
}) {
  const [open, setOpen] = useState(false);

  function linkClass(variant?: "primary") {
    return variant === "primary"
      ? "rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
      : "rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background";
  }

  return (
    <>
      <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.variant)}>
            {item.label}
          </Link>
        ))}
        {showSignOut && <SignOutButton />}
        <LanguageToggle />
      </nav>

      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? menuCloseLabel : menuOpenLabel}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-background"
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {open && (
          <div className="absolute inset-x-0 top-full z-40 border-b border-line bg-white px-4 py-3 shadow-md">
            <nav className="flex flex-col gap-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-base font-medium ${
                    item.variant === "primary"
                      ? "bg-primary text-white"
                      : "text-body hover:bg-background"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {showSignOut && (
                <div onClick={() => setOpen(false)}>
                  <SignOutButton />
                </div>
              )}
              <div className="pt-2">
                <LanguageToggle />
              </div>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}

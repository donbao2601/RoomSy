"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function SignOutButton() {
  const router = useRouter();
  const { t } = useLanguage();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-background"
    >
      {t("nav.signOut")}
    </button>
  );
}

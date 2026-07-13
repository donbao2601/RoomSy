"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function ProfileForm({
  userId,
  fullName,
  phone,
  avatarUrl,
}: {
  userId: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [values, setValues] = useState({
    full_name: fullName ?? "",
    phone: phone ?? "",
    avatar_url: avatarUrl ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("users")
        .update({
          full_name: values.full_name || null,
          phone: values.phone || null,
          avatar_url: values.avatar_url || null,
        })
        .eq("id", userId);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-body">
          {t("dashboard.tenant.fullName")}
        </label>
        <input
          className="input"
          value={values.full_name}
          onChange={(e) => setValues({ ...values, full_name: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-body">
          {t("dashboard.tenant.phone")}
        </label>
        <input
          className="input"
          value={values.phone}
          onChange={(e) => setValues({ ...values, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-body">
          {t("dashboard.tenant.avatarUrl")}
        </label>
        <input
          className="input"
          value={values.avatar_url}
          onChange={(e) => setValues({ ...values, avatar_url: e.target.value })}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? t("vip.processing") : t("dashboard.tenant.saveProfile")}
      </button>
      {saved && !isPending && (
        <span className="ml-3 text-sm font-medium text-primary">
          {t("dashboard.tenant.profileSaved")}
        </span>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/** Toggle UI-only — không có cột lưu preference trên users, không persist. */
export function NotifyToggle() {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(true);

  return (
    <label className="flex items-center gap-2 text-sm text-body">
      <input
        type="checkbox"
        checked={enabled}
        onChange={() => setEnabled((v) => !v)}
      />
      {t("dashboard.tenant.settingsNotify")}
    </label>
  );
}

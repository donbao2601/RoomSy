import Link from "next/link";
import type { CommunityCategory } from "@/lib/mock/community";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locale";

const TOPICS: CommunityCategory[] = ["guide", "warning", "roommate", "finance"];
const RULE_KEYS = ["community.sidebar.rule1", "community.sidebar.rule2", "community.sidebar.rule3"];

export function CommunitySidebar({ locale }: { locale: Locale }) {
  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-xl bg-background-soft p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          {t(locale, "community.sidebar.topicsTitle")}
        </h2>
        <ul className="flex flex-col gap-2">
          {TOPICS.map((category) => (
            <li key={category}>
              <Link
                href={`/community?category=${category}`}
                className="block rounded-lg px-3 py-2 text-sm text-body hover:bg-white hover:text-ink"
              >
                {t(locale, `community.category.${category}`)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-background-soft p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          {t(locale, "community.sidebar.rulesTitle")}
        </h2>
        <ul className="flex flex-col gap-2">
          {RULE_KEYS.map((key) => (
            <li key={key} className="flex gap-2 text-sm text-body">
              <span className="text-primary">•</span>
              <span>{t(locale, key)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-background-soft p-4">
        <h2 className="mb-2 text-sm font-semibold text-ink">
          {t(locale, "community.sidebar.supportTitle")}
        </h2>
        <p className="text-sm text-body">{t(locale, "community.sidebar.supportText")}</p>
        <p className="mt-1 text-sm font-medium text-primary">
          {t(locale, "community.sidebar.supportEmail")}
        </p>
      </div>
    </aside>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { AdminNav } from "@/components/admin/AdminNav";
import { ReportRowActions } from "@/components/admin/ReportRowActions";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";

type ReportRow = {
  id: string;
  target_type: "user" | "listing";
  target_id: string;
  reason: string | null;
  status: string;
  severity: "low" | "medium" | "high";
  created_at: string;
  reporter: { full_name: string | null; email: string } | null;
};

const SEVERITY_STYLE: Record<string, string> = {
  low: "bg-info-bg text-info",
  medium: "bg-warning-bg text-warning",
  high: "bg-error/10 text-error",
};

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default async function AdminReportsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const locale = getLocale();
  const supabase = createClient();

  const { data: reportsData } = await supabase
    .from("reports")
    .select("id, target_type, target_id, reason, status, severity, created_at, reporter:users(full_name, email)")
    .order("created_at", { ascending: true });

  const reports = (reportsData as unknown as ReportRow[]) ?? [];

  const listingIds = reports
    .filter((r) => r.target_type === "listing")
    .map((r) => r.target_id);
  const userIds = reports
    .filter((r) => r.target_type === "user")
    .map((r) => r.target_id);

  const { data: listingRows } = listingIds.length
    ? await supabase
        .from("listings")
        .select("id, title, user_id, status")
        .in("id", listingIds)
    : { data: [] };

  const ownerIds = (listingRows ?? []).map((l) => l.user_id);
  const allUserIds = Array.from(new Set([...userIds, ...ownerIds]));

  const { data: userRows } = allUserIds.length
    ? await supabase
        .from("users")
        .select("id, full_name, email, status")
        .in("id", allUserIds)
    : { data: [] };

  const listingMap = new Map((listingRows ?? []).map((l) => [l.id, l]));
  const userMap = new Map((userRows ?? []).map((u) => [u.id, u]));

  const sorted = [...reports].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
  });

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <AdminNav locale={locale} />

        <h1 className="mb-4 text-xl font-semibold text-ink">
          {t(locale, "admin.reports.title")}
        </h1>

        {sorted.length > 0 ? (
          <div className="overflow-x-auto rounded-xl bg-background-soft shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.reports.colTarget")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.reports.colReason")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.reports.colReporter")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.reports.colSeverity")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.reports.colStatus")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.reports.colAction")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const listing =
                    r.target_type === "listing" ? listingMap.get(r.target_id) : null;
                  const targetUser =
                    r.target_type === "user"
                      ? userMap.get(r.target_id)
                      : listing
                        ? userMap.get(listing.user_id)
                        : null;

                  return (
                    <tr key={r.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">
                          {r.target_type === "listing"
                            ? listing?.title ?? "—"
                            : targetUser?.full_name ?? targetUser?.email ?? "—"}
                        </p>
                        <p className="text-xs text-muted">
                          {t(
                            locale,
                            r.target_type === "listing"
                              ? "admin.reports.targetListing"
                              : "admin.reports.targetUser"
                          )}
                          {listing && targetUser
                            ? ` · ${targetUser.full_name ?? targetUser.email}`
                            : ""}
                        </p>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-body">{r.reason}</td>
                      <td className="px-4 py-3 text-body">
                        {r.reporter?.full_name ?? r.reporter?.email ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLE[r.severity]}`}
                        >
                          {t(locale, `admin.reports.severity${r.severity === "low" ? "Low" : r.severity === "medium" ? "Medium" : "High"}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-body">
                        {t(
                          locale,
                          r.status === "pending"
                            ? "admin.reports.statusPending"
                            : "admin.reports.statusResolved"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ReportRowActions
                          reportId={r.id}
                          severity={r.severity}
                          status={r.status}
                          targetType={r.target_type}
                          targetId={r.target_id}
                          listingOwnerId={listing?.user_id ?? null}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl bg-background-soft p-4 text-sm text-body shadow-sm">
            {t(locale, "admin.reports.empty")}
          </p>
        )}
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/getCurrentUser";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminUserRowActions } from "@/components/admin/AdminUserRowActions";
import { getLocale } from "@/lib/i18n/getLocale";
import { t } from "@/lib/i18n/translate";

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "tenant" | "landlord" | "admin";
  status: "active" | "banned";
  verified_badge: boolean;
};

const ROLE_FILTERS = [
  { value: "", key: "admin.users.roleAll" },
  { value: "tenant", key: "role.tenant" },
  { value: "landlord", key: "role.landlord" },
  { value: "admin", key: "role.admin" },
] as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string; q?: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") redirect("/");

  const locale = getLocale();
  const role = searchParams.role ?? "";
  const q = (searchParams.q ?? "").trim();

  const supabase = createClient();
  let query = supabase
    .from("users")
    .select("id, email, full_name, phone, role, status, verified_badge")
    .order("created_at", { ascending: false });

  if (role) query = query.eq("role", role);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);

  const { data: users } = await query;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <AdminNav locale={locale} />

        <h1 className="mb-4 text-xl font-semibold text-ink">
          {t(locale, "admin.users.title")}
        </h1>

        <form method="get" className="mb-4 flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder={t(locale, "admin.users.searchPlaceholder")}
            className="input max-w-xs"
          />
          <select name="role" defaultValue={role} className="input max-w-[180px]">
            {ROLE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {t(locale, f.key)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {t(locale, "search.apply")}
          </button>
        </form>

        <div className="overflow-hidden rounded-xl bg-background-soft shadow-sm">
          {users && users.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.users.colUser")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.users.colRole")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.users.colStatus")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.users.colVerified")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {t(locale, "admin.users.colActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(users as AdminUserRow[]).map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {u.full_name || "—"}
                      </p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-body">
                      {t(locale, `role.${u.role}`)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === "banned"
                            ? "bg-error/10 text-error"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {t(
                          locale,
                          u.status === "banned"
                            ? "admin.users.statusBanned"
                            : "admin.users.statusActive"
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.verified_badge
                            ? "bg-info-bg text-info"
                            : "bg-line text-muted"
                        }`}
                      >
                        {t(
                          locale,
                          u.verified_badge
                            ? "admin.users.verifiedYes"
                            : "admin.users.verifiedNo"
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AdminUserRowActions
                        userId={u.id}
                        status={u.status}
                        verifiedBadge={u.verified_badge}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-sm text-body">
              {t(locale, "admin.users.empty")}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

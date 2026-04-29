import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import InviteAdminForm from "./InviteAdminForm";
import AdminRowActions from "./AdminRowActions";

export const dynamic = "force-dynamic";

async function getAdminUsers() {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  return data.users.filter((u) => {
    const role = (u.app_metadata as Record<string, unknown> | undefined)?.role;
    return role === "admin" || u.invited_at;
  });
}

async function getCurrentUserId() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export default async function AdminsPage() {
  const [users, currentUserId] = await Promise.all([
    getAdminUsers(),
    getCurrentUserId(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Admin Users</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Invite new staff to the admin panel. They&apos;ll receive an email to
          set their password.
        </p>
      </div>

      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-navy">Invite new admin</h2>
        <InviteAdminForm />
      </div>

      <div className="rounded-xl border border-silver bg-white shadow-sm">
        <div className="border-b border-silver px-6 py-4">
          <h2 className="font-bold text-navy">Existing admins</h2>
        </div>
        {users.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-silver-dark">
            No admins yet.
          </p>
        ) : (
          <ul className="divide-y divide-silver">
            {users.map((u) => {
              const role = (u.app_metadata as Record<string, unknown> | undefined)
                ?.role;
              const needsInvite = !u.last_sign_in_at;
              const isSelf = u.id === currentUserId;
              return (
                <li
                  key={u.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">
                      {u.email}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-silver-dark">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-silver-dark">
                      {role === "admin" ? "Admin" : "No role"}
                      {" · "}
                      {u.last_sign_in_at
                        ? `Last signed in ${new Date(
                            u.last_sign_in_at,
                          ).toLocaleDateString("en-NZ")}`
                        : "Never signed in"}
                    </p>
                  </div>
                  <AdminRowActions
                    userId={u.id}
                    email={u.email ?? ""}
                    isSelf={isSelf}
                    needsInvite={needsInvite}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

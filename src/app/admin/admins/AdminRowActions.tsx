"use client";

import { useTransition } from "react";
import { resendInvite, sendPasswordRecovery, revokeAdmin, deleteAdminUser } from "./actions";

export default function AdminRowActions({
  userId,
  email,
  isSelf,
  needsInvite,
}: {
  userId: string;
  email: string;
  isSelf: boolean;
  needsInvite: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ error?: string; ok?: boolean }>, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    startTransition(async () => {
      const result = await fn();
      if (result.error) window.alert(result.error);
    });
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {needsInvite ? (
        <button
          disabled={pending}
          onClick={() => run(() => resendInvite(userId, email))}
          className="rounded border border-silver bg-white px-2 py-1 font-medium text-navy hover:bg-gray-50 disabled:opacity-50"
        >
          Resend invite
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => run(() => sendPasswordRecovery(email))}
          className="rounded border border-silver bg-white px-2 py-1 font-medium text-navy hover:bg-gray-50 disabled:opacity-50"
        >
          Send password reset
        </button>
      )}
      {!isSelf && (
        <>
          <button
            disabled={pending}
            onClick={() =>
              run(
                () => revokeAdmin(userId),
                `Revoke admin access for ${email}? They will no longer be able to sign in.`,
              )
            }
            className="rounded border border-amber-300 bg-amber-50 px-2 py-1 font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            Revoke admin
          </button>
          <button
            disabled={pending}
            onClick={() =>
              run(
                () => deleteAdminUser(userId),
                `Permanently delete ${email}? This cannot be undone.`,
              )
            }
            className="rounded border border-red-300 bg-red-50 px-2 py-1 font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}

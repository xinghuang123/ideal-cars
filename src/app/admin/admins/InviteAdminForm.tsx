"use client";

import { useState, useTransition } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { inviteAdmin } from "./actions";

export default function InviteAdminForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await inviteAdmin(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`Invitation sent to ${result.email}.`);
        setEmail("");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Input
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="newadmin@example.com"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Invite"}
      </Button>
      {(error || success) && (
        <div className="w-full sm:order-last sm:w-full">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}
        </div>
      )}
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import { replyToEnquiry } from "@/app/admin/reply-actions";

type ReplyTable =
  | "contact_enquiries"
  | "sell_car_enquiries"
  | "vehicle_enquiries";

export default function ReplyForm({
  table,
  id,
  to,
  customerName,
  defaultSubject,
}: {
  table: ReplyTable;
  id: string;
  to: string;
  customerName: string | null;
  defaultSubject: string;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  function handleSend() {
    setResult(null);
    startTransition(async () => {
      const res = await replyToEnquiry({
        table,
        id,
        to,
        customerName,
        subject,
        message,
      });
      if (res.error) {
        setResult({ type: "error", text: res.error });
        return;
      }
      setResult({ type: "success", text: `Reply sent to ${to}.` });
      setMessage("");
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded border border-accent bg-accent/10 px-2 py-1 text-xs font-medium text-navy hover:bg-accent/20"
        >
          Reply by email
        </button>
        {result && (
          <p
            className={`text-xs ${
              result.type === "success" ? "text-green-700" : "text-red-700"
            }`}
          >
            {result.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-silver bg-gray-50 p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-silver-dark">
          To
        </label>
        <p className="text-sm text-navy">{to || "(no email on file)"}</p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-silver-dark">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-md border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-silver-dark">
          Message
        </label>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply to the customer…"
          className="w-full rounded-md border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <p className="mt-1 text-xs text-silver-dark">
          Sends from the site address; replies come back to the dealership inbox.
        </p>
      </div>
      {result && (
        <p
          className={`text-xs ${
            result.type === "success" ? "text-green-700" : "text-red-700"
          }`}
        >
          {result.text}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={pending || !message.trim()}
        >
          {pending ? "Sending…" : "Send reply"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setResult(null);
          }}
          disabled={pending}
          className="rounded border border-silver bg-white px-3 py-1.5 text-sm font-medium text-navy hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

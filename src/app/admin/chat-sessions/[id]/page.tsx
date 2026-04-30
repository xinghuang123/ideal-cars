import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface MessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default async function ChatSessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: session } = await supabase
    .from("chat_sessions")
    .select("id, session_token, started_at, ended_at")
    .eq("id", params.id)
    .maybeSingle();

  if (!session) notFound();

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", params.id)
    .order("created_at", { ascending: true });

  const list = (messages ?? []) as MessageRow[];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/chat-sessions"
          className="text-sm text-silver-dark hover:text-accent"
        >
          ← Back to transcripts
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">Chat transcript</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Started {new Date(session.started_at).toLocaleString("en-NZ")} · {list.length}{" "}
          message{list.length === 1 ? "" : "s"}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No messages in this session.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-accent text-white"
                    : "border border-silver bg-white text-navy"
                }`}
              >
                <p className="mb-1 text-xs opacity-70">
                  {m.role === "user" ? "Customer" : "Ideal Cars AI"} ·{" "}
                  {new Date(m.created_at).toLocaleString("en-NZ")}
                </p>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

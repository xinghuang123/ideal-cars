import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SessionRow {
  id: string;
  session_token: string;
  started_at: string;
  ended_at: string | null;
  message_count: { count: number }[];
  first_message: { content: string; created_at: string }[];
}

export default async function ChatSessionsPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select(
      `id, session_token, started_at, ended_at,
       message_count:chat_messages(count),
       first_message:chat_messages(content, created_at)`,
    )
    .order("started_at", { ascending: false })
    .limit(100);

  const sessions = (data ?? []) as unknown as SessionRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Chat Transcripts</h1>
        <p className="mt-1 text-sm text-silver-dark">
          {sessions.length} sessions · most recent first
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No chat sessions yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const count = s.message_count?.[0]?.count ?? 0;
            const first = s.first_message?.[0];
            return (
              <li
                key={s.id}
                className="rounded-xl border border-silver bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy">
                      {count} message{count === 1 ? "" : "s"}
                    </p>
                    {first?.content && (
                      <p className="mt-1 truncate text-sm text-silver-dark">
                        First: {first.content}
                      </p>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-xs text-silver-dark">
                    {new Date(s.started_at).toLocaleString("en-NZ")}
                  </span>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/admin/chat-sessions/${s.id}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    View transcript →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

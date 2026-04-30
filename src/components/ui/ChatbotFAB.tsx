"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SuggestedVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  body_type: string | null;
  colour: string | null;
  stock_number: string | null;
  similarity: number;
}

interface ChatTurn {
  message: ChatMessage;
  vehicles?: SuggestedVehicle[];
}

const GREETING: ChatTurn = {
  message: {
    role: "assistant",
    content:
      "Hi! I'm Ideal Cars' AI assistant. Ask me about our stock — try \"red SUV under $30k\" or \"fuel efficient hatchback for the city\".",
  },
};

const SESSION_KEY = "idealcars-chat-session";

export default function ChatbotFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionRef.current = window.localStorage.getItem(SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const nextTurns: ChatTurn[] = [
      ...turns,
      { message: { role: "user", content: trimmed } },
    ];
    setTurns(nextTurns);
    setInput("");
    setBusy(true);

    try {
      const history = nextTurns
        .map((t) => t.message)
        .filter((m) => m.role === "user" || m.role === "assistant");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          sessionToken: sessionRef.current,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as {
        reply: string;
        sessionToken: string | null;
        vehicles: SuggestedVehicle[];
      };

      if (data.sessionToken && typeof window !== "undefined") {
        sessionRef.current = data.sessionToken;
        window.localStorage.setItem(SESSION_KEY, data.sessionToken);
      }

      setTurns((prev) => [
        ...prev,
        {
          message: { role: "assistant", content: data.reply },
          vehicles: data.vehicles,
        },
      ]);
    } catch (err) {
      console.error(err);
      setTurns((prev) => [
        ...prev,
        {
          message: {
            role: "assistant",
            content:
              "Sorry, I couldn't reach the assistant. Please try again, or contact us directly via the contact page.",
          },
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 flex h-[32rem] w-[22rem] flex-col rounded-xl border border-gray-200 bg-white shadow-2xl sm:w-96">
          <div className="flex items-center justify-between rounded-t-xl bg-navy px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                IC
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Ideal Cars AI</p>
                <p className="text-xs text-silver">Inventory-aware assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-silver hover:text-white"
              aria-label="Close chat"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {turns.map((turn, idx) => (
              <div key={idx}>
                <div
                  className={`flex ${
                    turn.message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                      turn.message.role === "user"
                        ? "bg-accent text-white"
                        : "bg-gray-100 text-navy"
                    }`}
                  >
                    {turn.message.content}
                  </div>
                </div>
                {turn.vehicles && turn.vehicles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {turn.vehicles.slice(0, 3).map((v) => (
                      <Link
                        key={v.id}
                        href={`/buy/${v.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs hover:border-accent hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-semibold text-navy">
                            {v.year} {v.make} {v.model}
                          </p>
                          <p className="text-silver-dark">
                            {v.body_type ? `${v.body_type} · ` : ""}
                            {v.colour ? `${v.colour} · ` : ""}
                            {v.mileage.toLocaleString("en-NZ")} km
                          </p>
                        </div>
                        <p className="font-semibold text-accent">
                          ${v.price.toLocaleString("en-NZ")}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-silver-dark">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-silver-dark [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-silver-dark [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-silver-dark" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex gap-2 border-t border-gray-200 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our cars..."
              disabled={busy}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-navy placeholder:text-silver-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg transition-all hover:bg-accent-dark hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

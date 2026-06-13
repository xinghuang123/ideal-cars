import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/embeddings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RetrievedVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  body_type: string | null;
  fuel_type: string | null;
  transmission: string | null;
  colour: string | null;
  engine_size: string | null;
  drive_type: string | null;
  description: string | null;
  features: string[] | null;
  status: string;
  stock_number: string | null;
  similarity: number;
}

const SYSTEM_PROMPT = `You are the online sales assistant for Ideal Cars, a used-car dealership in New Zealand. You are part of the Ideal Cars team — always speak as "we"/"us"/"our", never as a third party. Never say "the dealership", "contact the dealership", or "them" as if Ideal Cars is someone else; say "us", "give us a call", "come in and see us", "our team".

You help shoppers find the right vehicle from our live inventory. Each turn we retrieve the most relevant vehicles from our database and inject them into your context as JSON.

Rules:
- Only recommend vehicles that appear in the retrieved context. Never invent vehicles, prices, or specs.
- If the retrieved list does not match what the customer wants, say so honestly and ask a clarifying question rather than making something up.
- Keep replies concise (3-6 sentences). Use a warm, helpful NZ tone, as a friendly team member would. Prices in NZD, mileage in km.
- Use plain text only — no markdown formatting (no **bold**, no #, no bullet asterisks). The chat UI does not render markdown.
- When you mention a specific car, refer to it by year/make/model so the UI can link it.
- To arrange a viewing or test drive, or for finance and trade-ins, warmly invite the customer to get in touch with us: call us on 020 4190 7335, fill in the contact form on our website, or pop into the yard. Frame it as "us", e.g. "Give us a call on 020 4190 7335 and we'll book you in for a look."
- Never share customer personal data. Never claim to be human, but you may speak on behalf of the Ideal Cars team.`;

async function retrieveVehicles(query: string, limit = 5): Promise<RetrievedVehicle[]> {
  const supabase = createClient();
  const queryVec = await embed(query);
  const { data, error } = await supabase.rpc("match_vehicles", {
    query_embedding: queryVec as unknown as string,
    match_count: limit,
    min_similarity: 0.0,
    include_sold: false,
  });
  if (error) {
    console.error("match_vehicles RPC failed", error);
    return [];
  }
  return (data ?? []) as RetrievedVehicle[];
}

function formatVehicleForContext(v: RetrievedVehicle): string {
  const lines: string[] = [];
  lines.push(`- ${v.year} ${v.make} ${v.model} (stock #${v.stock_number ?? "n/a"})`);
  lines.push(`  Price: NZD $${Number(v.price).toLocaleString("en-NZ")}`);
  lines.push(`  Mileage: ${Number(v.mileage).toLocaleString("en-NZ")} km`);
  if (v.body_type) lines.push(`  Body: ${v.body_type}`);
  if (v.colour) lines.push(`  Colour: ${v.colour}`);
  if (v.fuel_type) lines.push(`  Fuel: ${v.fuel_type}`);
  if (v.transmission) lines.push(`  Transmission: ${v.transmission}`);
  if (v.drive_type) lines.push(`  Drive: ${v.drive_type}`);
  if (v.engine_size) lines.push(`  Engine: ${v.engine_size}`);
  if (v.features && v.features.length > 0) {
    lines.push(`  Features: ${v.features.slice(0, 6).join(", ")}`);
  }
  if (v.description) lines.push(`  Notes: ${v.description.slice(0, 200)}`);
  return lines.join("\n");
}

async function callDeepSeek(messages: ChatMessage[], context: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return retrievalOnlyFallback(context);
  }

  const systemMessage = {
    role: "system" as const,
    content: `${SYSTEM_PROMPT}\n\nRetrieved inventory for this turn:\n${context || "(no matches)"}`,
  };

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [systemMessage, ...messages],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("DeepSeek API error", res.status, text);
    return retrievalOnlyFallback(context);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content?.trim() || retrievalOnlyFallback(context);
}

function retrievalOnlyFallback(context: string): string {
  if (!context) {
    return "Sorry — I couldn't find anything in our current stock that matches that. Could you tell me a bit more about what you're after (budget, body type, fuel)?";
  }
  return `Here are the closest matches we have in stock right now:\n\n${context}\n\nLet me know which one you'd like to know more about, or describe what you're looking for and I'll narrow it down.`;
}

async function logTranscript(
  sessionToken: string | null,
  userMessage: string,
  assistantMessage: string,
): Promise<string | null> {
  try {
    const supabase = createClient();
    let sessionId: string | null = null;

    if (sessionToken) {
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("session_token", sessionToken)
        .maybeSingle();
      if (existing) sessionId = existing.id;
    }

    if (!sessionId) {
      const token = sessionToken ?? crypto.randomUUID();
      const { data: created, error } = await supabase
        .from("chat_sessions")
        .insert({ session_token: token })
        .select("id, session_token")
        .single();
      if (error) {
        console.error("Failed to create chat session", error);
        return sessionToken;
      }
      sessionId = created.id;
      sessionToken = created.session_token;
    }

    await supabase.from("chat_messages").insert([
      { session_id: sessionId, role: "user", content: userMessage },
      { session_id: sessionId, role: "assistant", content: assistantMessage },
    ]);

    return sessionToken;
  } catch (err) {
    console.error("Failed to log chat transcript", err);
    return sessionToken;
  }
}

export async function POST(request: NextRequest) {
  let body: { messages?: ChatMessage[]; sessionToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser || !lastUser.content.trim()) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  const trimmedHistory = messages.slice(-8);
  const vehicles = await retrieveVehicles(lastUser.content, 5);
  const context = vehicles.map(formatVehicleForContext).join("\n\n");

  const reply = await callDeepSeek(trimmedHistory, context);

  const sessionToken = await logTranscript(
    body.sessionToken ?? null,
    lastUser.content,
    reply,
  );

  return NextResponse.json({
    reply,
    sessionToken,
    vehicles: vehicles.map((v) => ({
      id: v.id,
      year: v.year,
      make: v.make,
      model: v.model,
      price: Number(v.price),
      mileage: Number(v.mileage),
      body_type: v.body_type,
      colour: v.colour,
      stock_number: v.stock_number,
      similarity: Number(v.similarity),
    })),
  });
}

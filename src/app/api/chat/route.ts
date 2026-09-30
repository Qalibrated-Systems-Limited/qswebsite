import { NextRequest, NextResponse } from "next/server";
import { allow, clientIp } from "@/utils/rateLimit";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;

// Fixed server-side instructions — clients can't supply their own system prompt,
// so the endpoint can't be used as a free general-purpose OpenAI proxy.
const SYSTEM_PROMPT =
  "You are the website assistant for Qalibrated Systems Limited, a Kenyan company providing weighing systems, " +
  "calibration (ISO/IEC 17025), industrial automation, intelligent transport and ICT solutions. Answer questions " +
  "about the company's products and services concisely and politely. For quotes or detailed technical support, " +
  "direct people to the Contact page. Politely decline requests unrelated to Qalibrated's business.";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!allow("chat-min", ip, 10, 60_000) || !allow("chat-day", ip, 150, 24 * 3_600_000)) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Chat is not available right now." }, { status: 503 });
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    if (!Array.isArray(body?.messages)) throw new Error();
    messages = body.messages
      .filter(
        (m: unknown): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
          typeof (m as ChatMessage).content === "string",
      )
      .slice(-MAX_MESSAGES)
      .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
    if (!messages.length || messages[messages.length - 1].role !== "user") throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI error:", response.status, data?.error?.message);
      return NextResponse.json({ error: "Chat is not available right now." }, { status: 502 });
    }
    // Return only what the widget needs.
    return NextResponse.json({ choices: [{ message: { content: data?.choices?.[0]?.message?.content ?? "" } }] });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Chat is not available right now." }, { status: 500 });
  }
}

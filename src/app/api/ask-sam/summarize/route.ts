import { NextRequest, NextResponse } from "next/server";
import { getModel, generateWithRetry } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ summary: "" });
  }

  const transcript = messages
    .filter((m: { role: string; content: string }) => m.role === "user")
    .map((m: { content: string }) => `- ${m.content}`)
    .join("\n");

  const model = getModel("gemini-2.5-flash");

  const prompt = `A visitor was chatting with an AI assistant about Samuel Abolo, a Senior Software Engineer. Based on the visitor's questions below, write a short, natural 2–3 sentence summary of what they were interested in, written as if the visitor is introducing themselves and their interest to Samuel. Do not mention the AI assistant. Keep it warm and direct.

Visitor's questions:
${transcript}

Write only the summary, no preamble.`;

  try {
    const summary = await generateWithRetry(model, prompt, { maxRetries: 2 });
    return NextResponse.json({ summary: summary.trim() });
  } catch {
    return NextResponse.json({ summary: "" });
  }
}

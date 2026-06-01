import { NextRequest, NextResponse } from "next/server";
import { getModel, generateWithRetry } from "@/lib/gemini";
import { embedText } from "@/lib/embeddings";
import { querySimilar } from "@/lib/pinecone";
import { checkGlobalRateLimit } from "@/lib/rate-limit";

export type Recommendation = {
  feature: "jd-analyzer" | "how-can-i-help" | "refer-me";
  reason: string;
};

export type AskSamAPIResponse = {
  response: string;
  uncertain: boolean;
  recommendations: Recommendation[];
};

type HistoryItem = { role: string; content: string };

// ── Pre-flight ────────────────────────────────────────────────────────────────
// Ask the LLM whether the question needs document context before spending
// tokens on embedding + Pinecone.
async function needsRAGContext(
  model: ReturnType<typeof getModel>,
  message: string,
  history: HistoryItem[]
): Promise<boolean> {
  const historyText = history.length
    ? history.slice(-4).map((h) => `${h.role}: ${h.content}`).join("\n")
    : "None";

  const prompt = `Decide whether this question about Samuel Abolo needs additional context retrieved from his resume documents to be answered accurately.

Baseline knowledge already in the system (professional facts only):
- All companies and roles: Boostr (current), TripAdvisor, NovaTrack, Credrails, Quibble, ExcelMind, Prunedge, ProDevs, Andela, VG Platform
- Key metrics: 360× pipeline speedup, 90% inference latency reduction, 99.5% deployment time cut
- Full tech stack: Python, Go, FastAPI, TensorFlow, PyTorch, LangChain, LangGraph, pgvector, FAISS, Kubernetes, Docker, Ray Serve, GCP, AWS
- Education: B.Sc. Software Engineering, Babcock University; valedictorian 2020
- Location: Nigerian, Lagos, open to relocation

Recent conversation:
${historyText}

Question: "${message}"

Respond with JSON only: { "needsContext": true } or { "needsContext": false }
- true  → question asks about personal details (hobbies, interests, personality, lifestyle), specific project details, exact technical implementations, or anything beyond the professional baseline above
- false → answerable purely from the professional baseline listed above, with no personal details needed`;

  try {
    const raw = await generateWithRetry(model, prompt, { json: true, maxRetries: 2 });
    const result = JSON.parse(raw);
    return result.needsContext === true;
  } catch {
    // If pre-flight fails, default to fetching context (safe fallback)
    return true;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // ── Global rate limit (Supabase, no PII) ─────────────────────────────────
  try {
    const result = await checkGlobalRateLimit();
    if (!result.allowed) {
      return NextResponse.json({ rateLimited: true }, { status: 429 });
    }
  } catch (err) {
    console.error("Rate limit check error:", err);
  }

  const historyItems: HistoryItem[] = history ?? [];
  const model = getModel("gemini-2.5-flash");

  // Step 1 — pre-flight: should we query the vector store?
  const fetchContext = await needsRAGContext(model, message, historyItems);

  // Step 2 — conditional RAG
  let context = "";
  if (fetchContext) {
    try {
      const queryEmbedding = await embedText(message);
      const matches = await querySimilar(queryEmbedding, 6);
      const chunks = matches
        .filter((m) => m.score && m.score > 0.5)
        .map((m) => (m.metadata as { text: string }).text)
        .join("\n\n");
      if (chunks) context = chunks;
    } catch (err) {
      console.error("Pinecone retrieval error:", err);
    }
  }

  // Step 3 — main response
  const systemPrompt = `You are an AI assistant on Samuel Abolo's personal website. You know Samuel extremely well and answer questions about him in third person — "He", "Sam", "Samuel". You speak warmly and knowledgeably, like a close colleague who has worked alongside him.

What you know about Samuel (professional facts only — do not add anything beyond this):
- Senior Software Engineer with 5+ years across ML, AI systems, backend engineering, and MLOps
- Currently at Boostr (via Zazmic), building multi-agent orchestration pipelines on GCP with Google ADK, Vertex AI, and Gemini
- Previously: TripAdvisor (cut AI deployment time from 2 weeks to 30 minutes, 360× ML pipeline speedup, 90% inference latency reduction), NovaTrack, Credrails, Quibble, Andela
- Stack: Python, Go, FastAPI, TensorFlow, PyTorch, LangChain, LangGraph, RAG pipelines, pgvector, FAISS, Kubernetes, Docker, Ray Serve, Snowflake, gRPC, Kafka, PostgreSQL, GCP, AWS
- Built a production RAG system using pgvector at Boostr for semantic retrieval across customer artifacts
- At ExcelMind he built a full RAG system using NLP models and vector search
- Founding engineer at Bookclinic (healthcare booking) and Remllo (fintech)
- Thesis: ML-based predictive model for colorectal cancer patient survival
- Valedictorian 2020, B.Sc. Software Engineering from Babcock University
- Nigerian, based in Lagos, open to relocation, targeting US companies

${context ? `Additional context from Samuel's resume relevant to this question:\n${context}` : ""}

Conversation so far:
${historyItems.map((h) => `${h.role}: ${h.content}`).join("\n") || "None"}

Question: ${message}

Respond with a JSON object in EXACTLY this format:
{
  "response": "<your answer — third person only, never 'I' or 'me', conversational, 2-4 sentences>",
  "uncertain": <true if you genuinely don't have confident specific information, or if this is better answered directly by Samuel — e.g. salary expectations, personal future plans, specific opinions he hasn't publicly shared>,
  "recommendations": [<zero, one, or two recommendation objects — only include if genuinely relevant>]
}

Recommendation object format: { "feature": "<feature-id>", "reason": "<one short sentence why this is relevant>" }

Feature IDs and when to recommend them:
- "jd-analyzer" — user is asking about fit for a specific role, whether Sam matches a job, or how he'd do in an interview
- "how-can-i-help" — user describes a business or technical problem and wonders if/how Sam could help solve it
- "refer-me" — user wants to refer Sam to someone, needs referral content, or is asking about how to introduce him

Rules:
- Always refer to Samuel in third person: "He", "Sam", "Samuel" — never "I" or "me"
- Be conversational and direct. No bullet-point essays.
- Never say "the provided details mention" or "based on the document"
- Don't oversell — his real track record is strong enough
- CRITICAL: Never state personal details (hobbies, interests, personality traits, lifestyle) that are not explicitly present in the document context provided above. If asked about something personal that isn't in the context, set uncertain: true and say so honestly rather than guessing or inferring.`;

  try {
    const raw = await generateWithRetry(model, systemPrompt, { json: true });
    const parsed: AskSamAPIResponse = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error) {
    const isRateLimit =
      error instanceof Error &&
      (error.message.includes("429") ||
        error.message.includes("Resource has been exhausted") ||
        error.message.includes("quota"));
    if (isRateLimit) {
      return NextResponse.json({ rateLimited: true }, { status: 429 });
    }
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Failed to get response. Please try again." }, { status: 500 });
  }
}

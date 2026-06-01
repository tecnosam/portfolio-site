import { NextRequest, NextResponse } from "next/server";
import { getModel, generateWithRetry } from "@/lib/gemini";
import { checksum, getCached, setCached } from "@/lib/cache";
import { embedText } from "@/lib/embeddings";
import { querySimilar } from "@/lib/pinecone";

export async function POST(req: NextRequest) {
  const { businessInfo } = await req.json();

  if (!businessInfo?.trim()) {
    return NextResponse.json({ error: "Business information is required" }, { status: 400 });
  }

  const cacheKey = `help:${checksum(businessInfo)}`;
  const cached = await getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  let profileContext = "";
  try {
    const embedding = await embedText(businessInfo.slice(0, 600));
    const matches = await querySimilar(embedding, 10);
    profileContext = matches
      .filter((m) => m.score && m.score > 0.45)
      .map((m) => (m.metadata as { text: string }).text)
      .join("\n\n");
  } catch (err) {
    console.error("RAG retrieval error:", err);
  }

  const model = getModel("gemini-2.5-flash");

  const prompt = `You are Samuel Abolo, a Senior Software Engineer. A business has shared their context with you. Generate a detailed, specific, and genuinely useful analysis of how YOU (Samuel) can help their business.

YOUR PROFILE:
${profileContext || "Senior Software Engineer with 5+ years across ML, AI systems, backend engineering, and MLOps."}

BUSINESS INFORMATION SHARED:
${businessInfo}

Generate a compelling analysis in JSON format (return ONLY valid JSON, no markdown):
{
  "headline": "<catchy one-liner about how Sam can help this specific business>",
  "summary": "<2-3 sentences: the core value Sam brings to this business specifically>",
  "immediateWins": [
    {
      "area": "<specific area>",
      "problem": "<problem you identified in their business>",
      "solution": "<specific thing Sam would do>",
      "impact": "<expected outcome with rough metrics if possible>",
      "timeframe": "<how quickly this could be delivered>"
    }
  ],
  "strategicValue": [
    {
      "initiative": "<strategic initiative>",
      "description": "<what Sam would build or design>",
      "whySam": "<why Sam specifically is positioned to do this>",
      "outcome": "<business outcome>"
    }
  ],
  "techRecommendations": [
    {
      "current": "<what they likely have or are doing>",
      "recommended": "<what Sam would recommend>",
      "reasoning": "<why this is better for their situation>"
    }
  ],
  "engagementModels": [
    { "type": "<Full-time / Contract / Advisory>", "description": "<what this would look like>", "bestFor": "<when this model makes sense>" }
  ],
  "callToAction": "<specific next step Sam recommends for this business>"
}`;

  try {
    const text = await generateWithRetry(model, prompt, { json: true });
    const analysis = JSON.parse(text);
    await setCached(cacheKey, analysis);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}

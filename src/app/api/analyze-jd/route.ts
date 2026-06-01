import { NextRequest, NextResponse } from "next/server";
import { getModel, generateWithRetry } from "@/lib/gemini";
import { checksum, getCached, setCached } from "@/lib/cache";
import { embedText } from "@/lib/embeddings";
import { querySimilar } from "@/lib/pinecone";

function buildPrompt(jobDescription: string, profileContext: string): string {
  return `You are an expert career coach and resume analyst. Analyze how well Samuel Abolo fits the following job description.

SAMUEL'S PROFILE:
${profileContext}

JOB DESCRIPTION:
${jobDescription}

Provide an analysis in the following JSON format (return ONLY valid JSON, no markdown).
Keep analysis fields (scoreReasoning, strengths, gaps, highlightedExperience, verdict) concise — 1-2 sentences each, max 4 items per array.
The tailoredResume section should be detailed and high-quality — this is the most important output.
{
  "fitScore": <number 1-100>,
  "scoreReasoning": "<2 sentences>",
  "strengths": [
    { "skill": "<skill>", "evidence": "<one specific example>", "relevance": "<one sentence>" }
  ],
  "gaps": [
    { "requirement": "<requirement>", "assessment": "<one sentence>", "mitigation": "<one sentence>" }
  ],
  "highlightedExperience": [
    { "company": "<company>", "achievement": "<achievement>", "relevance": "<one sentence>" }
  ],
  "tailoredResume": {
    "summary": "<3 sentences that directly connect Samuel's specific background to this role — name relevant companies/technologies, be concrete not generic>",
    "topSkills": ["<skill explicitly required by JD>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
    "relevantExperience": [
      {
        "company": "<company from Samuel's background>",
        "role": "<exact role title>",
        "period": "<period>",
        "tailoredBullets": [
          "<strong action verb + specific achievement + quantified metric, showing direct fit for THIS JD's requirements>",
          "<bullet 2 — different aspect relevant to JD>",
          "<bullet 3 — third key contribution relevant to JD>"
        ]
      }
    ],
    "whyHire": "<2 compelling sentences making the case for Samuel specifically for THIS role — reference specific requirements from the JD and how Samuel's background meets them>"
  },
  "verdict": "<one impactful sentence>"
}`;
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return new TextDecoder().decode(bytes);
  }

  const model = getModel("gemini-2.5-flash");
  const base64 = Buffer.from(bytes).toString("base64");
  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType: file.type || "application/pdf" } },
    "Extract all the text from this document. Return only the raw text content, no formatting or commentary.",
  ]);
  return result.response.text();
}

async function fetchRAGContext(query: string): Promise<string> {
  const embedding = await embedText(query);
  const matches = await querySimilar(embedding, 10);
  return matches
    .filter((m) => m.score && m.score > 0.45)
    .map((m) => (m.metadata as { text: string }).text)
    .join("\n\n");
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  let jobDescription = "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("jobDescription") as string | null;
    jobDescription = file ? await extractTextFromFile(file) : (text ?? "");
  } else {
    const body = await req.json();
    jobDescription = body.jobDescription || "";
  }

  if (!jobDescription?.trim()) {
    return NextResponse.json({ error: "Job description is required" }, { status: 400 });
  }

  const cacheKey = `jd:${checksum(jobDescription)}`;
  const cached = await getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  const model = getModel("gemini-2.5-flash");

  let profileContext = "";
  try {
    profileContext = await fetchRAGContext(jobDescription.slice(0, 600));
  } catch (err) {
    console.error("RAG retrieval error:", err);
  }

  try {
    const text = await generateWithRetry(model, buildPrompt(jobDescription, profileContext), { json: true });
    const analysis = JSON.parse(text);
    await setCached(cacheKey, analysis);
    // processedJobDescription is returned for the client-side CTA but not stored in cache
    return NextResponse.json({ ...analysis, processedJobDescription: jobDescription });
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}

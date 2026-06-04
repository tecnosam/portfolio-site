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
    "summary": "<2-3 sentences. State Samuel's title, years of experience, and the 2-3 most relevant things he has done. Name actual companies and technologies. No generic filler.>",
    "topSkills": ["<skill explicitly listed in JD>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
    "relevantExperience": [
      {
        "company": "<company from Samuel's background>",
        "role": "<exact role title>",
        "period": "<period>",
        "tailoredBullets": [
          "<action verb + what was built + tech stack used + quantified result. Stop there. No clause explaining why it matters for the role. No 'directly,' 'crucial for,' 'demonstrating expertise in,' 'precisely aligning,' or 'establishing.' No em dashes.>",
          "<bullet 2 — same format: verb, what, tech, number. Choose accomplishments whose keywords naturally overlap with the JD without stating the overlap.>",
          "<bullet 3>"
        ]
      }
    ],
    "whyHire": "<2 sentences. Concrete: name the role requirement, name the specific Samuel achievement that meets it. No vague praise.>",
    "education": [
      {
        "institution": "<institution name exactly as it appears in the documents>",
        "degree": "<degree or qualification>",
        "period": "<years>",
        "note": "<thesis title, or achievement such as Valedictorian, if present in documents — otherwise omit this field>"
      }
    ]
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
  // Fetch all vectors (index has ~13) so the AI sees the full document set,
  // not just the semantically closest chunks — prevents skills/tools from being dropped.
  const matches = await querySimilar(embedding, 20);
  return matches
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
    profileContext = await fetchRAGContext(jobDescription);
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

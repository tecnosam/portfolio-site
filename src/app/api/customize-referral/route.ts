import { NextRequest, NextResponse } from "next/server";
import { getModel, generateWithRetry } from "@/lib/gemini";
import { checksum, getCached, setCached } from "@/lib/cache";
import { embedText } from "@/lib/embeddings";
import { querySimilar } from "@/lib/pinecone";

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
    "Extract all text from this document. Return only the raw text.",
  ]);
  return result.response.text();
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  let jobTitle = "";
  let jobDescription = "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    jobTitle = (formData.get("jobTitle") as string) || "";
    const jdText = (formData.get("jobDescription") as string) || "";
    const file = formData.get("file") as File | null;
    jobDescription = file ? await extractTextFromFile(file) : jdText;
  } else {
    const body = await req.json();
    jobTitle = body.jobTitle || "";
    jobDescription = body.jobDescription || "";
  }

  if (!jobTitle && !jobDescription) {
    return NextResponse.json({ error: "Job title or description is required" }, { status: 400 });
  }

  const cacheKey = `refer:${checksum(jobTitle, jobDescription)}`;
  const cached = await getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  // Build a search query that surfaces the most relevant parts of Samuel's documents
  const searchQuery = [jobTitle, jobDescription.slice(0, 400)].filter(Boolean).join(" ");

  let ragContext = "";
  try {
    const embedding = await embedText(searchQuery);
    const matches = await querySimilar(embedding, 10);
    ragContext = matches
      .filter((m) => m.score && m.score > 0.45)
      .map((m) => (m.metadata as { text: string }).text)
      .join("\n\n");
  } catch (err) {
    console.error("RAG retrieval error:", err);
  }

  const roleContext = jobDescription
    ? `Job Description:\n${jobDescription}`
    : `Target Job Title: ${jobTitle}`;

  const model = getModel("gemini-2.5-flash");

  const prompt = `You are helping someone refer Samuel Abolo for a specific role. Generate a customized referral kit tailored to this specific position.

RELEVANT CONTEXT FROM SAMUEL'S DOCUMENTS:
${ragContext || "No additional context retrieved — use your best knowledge of Samuel's profile."}

TARGET ROLE CONTEXT:
${roleContext}

Generate a customized referral kit in JSON format (return ONLY valid JSON, no markdown):
{
  "inferredRole": "<what role/title you inferred from the context>",
  "elevatorPitch": "<3-4 sentence elevator pitch tailored specifically to this role - mention Sam's most relevant achievements>",
  "keyStrengths": [
    "<use **bold** for key technologies, metrics, or achievements. One tight sentence most relevant to this role with specific evidence.>",
    "<strength 2>",
    "<strength 3>",
    "<strength 4>",
    "<strength 5>"
  ],
  "whyNow": "<1-2 sentences on why Sam is an especially timely hire for this type of role>",
  "topAchievements": [
    { "achievement": "<specific quantified achievement>", "relevance": "<why it matters for this role>" }
  ],
  "suggestedSubject": "<suggested email subject line for the referral>",
  "relevantExperience": [
    {
      "company": "<company name from Samuel's background>",
      "role": "<exact role title>",
      "period": "<period>",
      "highlights": [
        "<action verb + what was built + tech used + quantified result. No clause explaining relevance to the role. No 'directly,' 'crucial for,' 'demonstrating,' 'precisely aligning.' No em dashes.>",
        "<bullet 2 — same format>",
        "<bullet 3>"
      ]
    }
  ],
  "relevantSkills": [
    {
      "category": "<must be exactly one of: Machine Learning, AI & LLM Systems, Backend Engineering, MLOps & Model Serving, Distributed Systems, Cloud & Observability>",
      "items": ["<most relevant skills from that category for this role>"]
    }
  ]
}

For relevantExperience: select 2-3 roles most relevant to the target role with highlights tailored to demonstrate fit.
For relevantSkills: select 3-4 categories most relevant to the target role with only the pertinent skills within each.`;

  try {
    const text = await generateWithRetry(model, prompt, { json: true });
    const result = JSON.parse(text);
    await setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Customization failed. Please try again." }, { status: 500 });
  }
}

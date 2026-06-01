import { NextRequest, NextResponse } from "next/server";
import { getModel, generateWithRetry } from "@/lib/gemini";
import { resumeContext } from "@/lib/data";
import { checksum, getCached, setCached } from "@/lib/cache";

function buildPrompt(jobDescription: string): string {
  return `You are an expert career coach and resume analyst. Analyze how well Samuel Abolo fits the following job description.

SAMUEL'S PROFILE:
${resumeContext}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed analysis in the following JSON format (return ONLY valid JSON, no markdown):
{
  "fitScore": <number 1-100>,
  "scoreReasoning": "<2-3 sentence explanation of the score>",
  "strengths": [
    { "skill": "<skill or experience>", "evidence": "<specific example from Sam's background>", "relevance": "<why this matters for the role>" }
  ],
  "gaps": [
    { "requirement": "<what the JD asks for>", "assessment": "<honest assessment of gap>", "mitigation": "<how Sam could address this>" }
  ],
  "highlightedExperience": [
    { "company": "<company>", "achievement": "<specific achievement>", "relevance": "<connection to JD>" }
  ],
  "tailoredResume": {
    "summary": "<3-4 sentence tailored summary for this specific role>",
    "topSkills": ["<skill1>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
    "relevantExperience": [
      {
        "company": "<company>",
        "role": "<role>",
        "period": "<period>",
        "tailoredBullets": ["<bullet 1 tailored to JD>", "<bullet 2 tailored to JD>", "<bullet 3 tailored to JD>"]
      }
    ],
    "whyHire": "<compelling 2-sentence pitch for hiring Sam for THIS specific role>"
  },
  "verdict": "<one impactful sentence summarizing Sam's fit for this role>"
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

  try {
    const text = await generateWithRetry(model, buildPrompt(jobDescription), { json: true });
    const analysis = JSON.parse(text);
    await setCached(cacheKey, analysis);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}

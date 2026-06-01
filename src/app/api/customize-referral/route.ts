import { NextRequest, NextResponse } from "next/server";
import { getModel, generateWithRetry } from "@/lib/gemini";
import { resumeContext } from "@/lib/data";
import { checksum, getCached, setCached } from "@/lib/cache";

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

  const context = jobDescription
    ? `Job Description:\n${jobDescription}`
    : `Target Job Title: ${jobTitle}`;

  const model = getModel("gemini-2.5-flash");

  const prompt = `You are helping someone refer Samuel Abolo for a specific role. Generate a customized referral kit tailored to this specific position.

SAMUEL'S FULL PROFILE:
${resumeContext}

TARGET ROLE CONTEXT:
${context}

Generate a customized referral kit in JSON format (return ONLY valid JSON, no markdown):
{
  "inferredRole": "<what role/title you inferred from the context>",
  "elevatorPitch": "<3-4 sentence elevator pitch tailored specifically to this role - mention Sam's most relevant achievements>",
  "keyStrengths": [
    "<strength 1 most relevant to this role with specific evidence>",
    "<strength 2 most relevant to this role with specific evidence>",
    "<strength 3 most relevant to this role with specific evidence>",
    "<strength 4 most relevant to this role with specific evidence>",
    "<strength 5 most relevant to this role with specific evidence>"
  ],
  "whyNow": "<1-2 sentences on why Sam is an especially timely hire for this type of role>",
  "topAchievements": [
    { "achievement": "<specific quantified achievement>", "relevance": "<why it matters for this role>" }
  ],
  "suggestedSubject": "<suggested email subject line for the referral>"
}`;

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

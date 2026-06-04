import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getModel, generateWithRetry } from "@/lib/gemini";
import { embedText } from "@/lib/embeddings";
import { querySimilar } from "@/lib/pinecone";

const ALLOWED = new Set(["ikabolo59@gmail.com", "abolosamuel6@gmail.com"]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ALLOWED.has(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobDescription, questions } = await req.json() as {
    jobDescription: string;
    questions: string[];
  };

  if (!jobDescription?.trim()) {
    return NextResponse.json({ error: "Job description is required" }, { status: 400 });
  }

  // Fetch ALL vectors — small index, full context is better than partial
  let ragContext = "";
  try {
    const embedding = await embedText(jobDescription);
    const matches = await querySimilar(embedding, 20);
    ragContext = matches.map((m) => (m.metadata as { text: string }).text).join("\n\n");
  } catch (err) {
    console.error("RAG error:", err);
  }

  const model = getModel("gemini-2.5-pro");
  const filteredQuestions = (questions ?? []).filter((q) => q.trim());

  const guidanceSection = filteredQuestions.length > 0
    ? `For each question below, provide 3-5 bullet points on HOW Samuel should approach his answer:
- Which specific project, company, or achievement to lead with
- What angle or framing positions him best for this role
- What metrics or outcomes to highlight
- What the question is really testing and how to address it directly

Do NOT write the full answer. Give tight, actionable bullets.

Questions:
${filteredQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
    : `Provide 4-6 strategic positioning bullets covering:
- Which experiences from his background are the strongest fit and why
- Key achievements to lead with in the application and interviews
- Any gaps to be aware of and how to address them
- The best narrative angle for this specific role`;

  const prompt = `You are helping Samuel Abolo prepare for a job application. Based on his background and the job description, produce two things: strategic guidance AND a tailored one-page resume.

SAMUEL'S RELEVANT BACKGROUND (from his documents):
${ragContext || "Senior Software Engineer with 5+ years across ML, AI systems, backend engineering, and MLOps."}

JOB DESCRIPTION:
${jobDescription}

${guidanceSection}

Also generate a tailored resume for this specific role. Resume bullet rules:
- Format: action verb + what was built + tech used + quantified result. Stop there.
- No clause explaining why it matters for the role.
- No "directly," "crucial for," "demonstrating," "precisely aligning," or em dashes.
- Select accomplishments whose keywords naturally overlap with the JD.

Respond in JSON:
{
  "role": "<inferred role title>",
  "guidance": [{ "question": "${filteredQuestions.length > 0 ? "<question text>" : "Role Positioning"}", "bullets": ["<bullet>"] }],
  "tailoredResume": {
    "summary": "<2-3 sentences connecting Samuel's specific background to this role. Name companies and technologies. No generic filler.>",
    "topSkills": ["<skill from JD>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
    "relevantExperience": [
      {
        "company": "<company>",
        "role": "<exact role title>",
        "period": "<period>",
        "tailoredBullets": ["<bullet>", "<bullet>", "<bullet>"]
      }
    ],
    "education": [
      {
        "institution": "<institution from documents>",
        "degree": "<degree>",
        "period": "<period>",
        "note": "<thesis or achievement if in documents>"
      }
    ]
  }
}`;

  try {
    const raw = await generateWithRetry(model, prompt, { json: true });
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Failed to generate. Please try again." }, { status: 500 });
  }
}

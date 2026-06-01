import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await getDb()
    .from("jd_submissions")
    .select("job_description, inferred_role, fit_score, verdict")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({
    jobDescription: data.job_description,
    inferredRole: data.inferred_role,
    fitScore: data.fit_score,
    verdict: data.verdict,
  });
}

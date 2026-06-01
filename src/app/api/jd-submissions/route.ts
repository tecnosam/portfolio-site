import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { jobDescription, inferredRole, fitScore, verdict } = await req.json();

  const { data, error } = await getDb()
    .from("jd_submissions")
    .insert({
      job_description: jobDescription ?? "",
      inferred_role: inferredRole ?? "",
      fit_score: fitScore ?? 0,
      verdict: verdict ?? "",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

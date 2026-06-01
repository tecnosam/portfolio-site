import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { businessInfo, analysis } = await req.json();

  if (!businessInfo || !analysis) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await getDb()
    .from("help_inquiries")
    .insert({ business_info: businessInfo, analysis })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

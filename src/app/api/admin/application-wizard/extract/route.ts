import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/gemini";

const ALLOWED = new Set(["ikabolo59@gmail.com", "abolosamuel6@gmail.com"]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ALLOWED.has(user.email ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    const text = await file.text();
    return NextResponse.json({ text });
  }

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const model = getModel("gemini-2.5-flash");
  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType: file.type || "application/pdf" } },
    "Extract all text from this document. Return only the raw text content.",
  ]);

  return NextResponse.json({ text: result.response.text() });
}

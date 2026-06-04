import { createClient } from "@/lib/supabase/server";
import SubmissionsClient from "./SubmissionsClient";

type JDSubmission = {
  id: string;
  inferred_role: string;
  fit_score: number;
  verdict: string;
  job_description: string;
};

type HelpInquiry = {
  id: string;
  business_info: string;
  analysis: { headline?: string; summary?: string };
};

export type EnrichedMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
  jdSubmission?: JDSubmission;
  helpInquiry?: HelpInquiry;
};

const JD_REF    = /—\s*JD Reference:\s*([0-9a-f-]{36})/i;
const INQUIRY_REF = /—\s*AI Analysis Ref:\s*([0-9a-f-]{36})/i;

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (!messages) return <p className="text-base-content/50 text-sm">No messages yet.</p>;

  // Collect referenced IDs
  const jdIds: string[]      = [];
  const inquiryIds: string[] = [];

  messages.forEach((m) => {
    const jd = m.message?.match(JD_REF)?.[1];
    const iq = m.message?.match(INQUIRY_REF)?.[1];
    if (jd) jdIds.push(jd);
    if (iq) inquiryIds.push(iq);
  });

  const [{ data: jdRows }, { data: inquiryRows }] = await Promise.all([
    jdIds.length
      ? supabase.from("jd_submissions").select("*").in("id", jdIds)
      : Promise.resolve({ data: [] }),
    inquiryIds.length
      ? supabase.from("help_inquiries").select("*").in("id", inquiryIds)
      : Promise.resolve({ data: [] }),
  ]);

  const jdMap     = new Map((jdRows     ?? []).map((r) => [r.id, r]));
  const inquiryMap = new Map((inquiryRows ?? []).map((r) => [r.id, r]));

  const enriched: EnrichedMessage[] = messages.map((m) => {
    const jdId  = m.message?.match(JD_REF)?.[1];
    const iqId  = m.message?.match(INQUIRY_REF)?.[1];
    return {
      ...m,
      jdSubmission:  jdId ? jdMap.get(jdId) : undefined,
      helpInquiry:   iqId ? inquiryMap.get(iqId) : undefined,
    };
  });

  const unread = enriched.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-base-content">Submissions</h1>
          <p className="text-base-content/50 text-sm mt-0.5">{enriched.length} total · {unread} unread</p>
        </div>
      </div>

      <SubmissionsClient messages={enriched} />
    </div>
  );
}

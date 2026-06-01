import { createClient } from "@supabase/supabase-js";

const GLOBAL_DAILY_LIMIT = 5_000;

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "global" };

export async function checkGlobalRateLimit(): Promise<RateLimitResult> {
  const { data: count } = await getDb().rpc("increment_rate_limit", {
    p_key: "global:ask-sam",
  });
  if (typeof count === "number" && count > GLOBAL_DAILY_LIMIT) {
    return { allowed: false, reason: "global" };
  }
  return { allowed: true };
}

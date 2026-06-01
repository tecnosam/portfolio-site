import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { getIndex } from "./pinecone";

const TTL_MS = 24 * 60 * 60 * 1000;   // 24 h entry lifetime
const STATS_TTL_MS = 5 * 60 * 1000;   // re-check Pinecone at most every 5 min

// Plain server-side client — cache ops don't need user cookies
function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Pinecone version is kept in-process — it's just a number
let cachedVersion: number | null = null;
let cachedVersionAt = 0;

async function getPineconeVersion(): Promise<number> {
  const now = Date.now();
  if (cachedVersion !== null && now - cachedVersionAt < STATS_TTL_MS) {
    return cachedVersion;
  }
  try {
    const stats = await getIndex().describeIndexStats();
    cachedVersion = stats.totalRecordCount ?? 0;
    cachedVersionAt = now;
  } catch {
    cachedVersion ??= 0;
  }
  return cachedVersion;
}

export function checksum(...inputs: string[]): string {
  return createHash("sha256").update(inputs.join("\0")).digest("hex").slice(0, 24);
}

export async function getCached<T>(key: string): Promise<T | null> {
  const { data, error } = await getDb()
    .from("ai_cache")
    .select("value, pinecone_version, created_at")
    .eq("cache_key", key)
    .single();

  if (error || !data) return null;

  if (Date.now() - new Date(data.created_at).getTime() > TTL_MS) {
    await getDb().from("ai_cache").delete().eq("cache_key", key);
    return null;
  }

  const version = await getPineconeVersion();
  if (version !== data.pinecone_version) {
    await getDb().from("ai_cache").delete().eq("cache_key", key);
    return null;
  }

  return data.value as T;
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  const version = await getPineconeVersion();
  await getDb()
    .from("ai_cache")
    .upsert({ cache_key: key, value, pinecone_version: version, created_at: new Date().toISOString() });
}

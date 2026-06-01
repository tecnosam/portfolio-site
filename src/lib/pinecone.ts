import { Pinecone } from "@pinecone-database/pinecone";

let client: Pinecone | null = null;

function getClient() {
  if (!client) {
    client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  }
  return client;
}

export function getIndex() {
  return getClient().index(process.env.PINECONE_INDEX_NAME!);
}

export type PineconeChunk = {
  id: string;
  values: number[];
  metadata: Record<string, string>;
};

export async function upsertChunks(chunks: PineconeChunk[]) {
  const index = getIndex();
  for (let i = 0; i < chunks.length; i += 100) {
    await index.upsert({ records: chunks.slice(i, i + 100) });
  }
}

export async function querySimilar(embedding: number[], topK = 5) {
  const index = getIndex();
  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });
  return results.matches;
}

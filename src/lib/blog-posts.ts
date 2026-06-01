export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  date: string;
  featured: boolean;
  aiGenerated?: boolean;
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "production-rag-pgvector",
    title: "Production RAG with pgvector: What Nobody Tells You",
    excerpt: "After building RAG systems at scale, processing millions of embeddings with pgvector, here are the hard lessons about latency, cost, and correctness that most tutorials skip.",
    tags: ["RAG", "pgvector", "AI Infrastructure"],
    readTime: "8 min",
    date: "May 2025",
    featured: true,
    aiGenerated: true,
    content: `
# Production RAG with pgvector: What Nobody Tells You

Every RAG tutorial shows you how to insert text, generate embeddings, and run a similarity search. None show you what happens six months later when you have 50 million vectors, sub-200ms SLA requirements, and an engineering team asking why the embedding API bill doubled.

Here are the lessons I wish I had before shipping RAG to production.

![A diagram showing a RAG pipeline with retrieval, reranking, and generation stages](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80)

## 1. Your Index Strategy Matters More Than Your Embedding Model

The first mistake most teams make: spending weeks choosing between embedding models while ignoring pgvector index configuration.

By default, pgvector does exact nearest-neighbor search. Accurate, yes. But O(n) over the number of vectors. For any dataset beyond a few hundred thousand rows, you need HNSW or IVFFlat indexes.

\`\`\`sql
-- HNSW: better recall, slower build, faster queries
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- IVFFlat: faster build, needs vacuum after bulk inserts
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
\`\`\`

Switching from sequential scan to HNSW at 5M vectors gave a 12x improvement in query latency. The embedding model choice moved relevance by roughly 3-4%. The index choice moved latency by 12x. Get the index right first.

## 2. Partition Your Vectors Early

Storing all embeddings in a single table is a mistake you pay for later. At scale, your indexes grow enormous, vacuums take forever, and isolating one tenant's data becomes expensive.

Partition by tenant or document collection from day one:

\`\`\`sql
CREATE TABLE documents (
  id uuid,
  tenant_id uuid NOT NULL,
  content text,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
) PARTITION BY HASH (tenant_id);
\`\`\`

Retrofitting partitioning on a live, high-traffic table is painful. Do not wait.

## 3. Retrieval and Relevance Are Not the Same Thing

pgvector returns the most similar chunks, not the most relevant ones for your specific query. This distinction matters in production.

Semantically similar text will rank highly and still completely miss the user's intent. The fix is a two-stage retrieval pipeline:

1. Recall: fetch the top 50 candidates from pgvector (fast, approximate)
2. Rerank: run a cross-encoder to score the top 50 against the original query and return the top 5

The added latency, around 80ms, is worth the quality improvement.

## 4. Version Your Embeddings

Embedding models get updated. OpenAI has changed embedding dimensions multiple times. If you store embeddings and later update your model, your existing vectors live in a different space than your new ones.

Version embeddings from the start:

\`\`\`sql
ALTER TABLE documents ADD COLUMN embedding_model text DEFAULT 'text-embedding-3-small-v1';
\`\`\`

When the model changes, trigger a background job to re-embed affected documents. Never mix embeddings from different models in the same similarity search.

## 5. Cost Is a Design Constraint

At 10M+ documents, your embedding API costs will surprise you. Three things help:

- Cache embeddings aggressively. If the same query comes in twice, skip the re-embed.
- Batch ingestion. Calling the embedding API one document at a time is where costs spiral.
- Use smaller models for early filtering. A cheap model for a quick relevance check, a larger model only for final reranking.

---

RAG looks simple in demos. In production, the work is in index design, retrieval pipeline architecture, and monitoring. Get those right and you will have a system built to last.
    `,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

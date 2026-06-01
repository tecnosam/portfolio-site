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
  {
    slug: "ml-deployment-automation",
    title: "How We Reduced AI Service Deployment Time by 99.5%",
    excerpt: "Deploying a new AI inference service took two weeks. We cut that to 30 minutes. Here is the architecture, the tooling, and the lessons learned.",
    tags: ["MLOps", "Kubernetes", "CI/CD"],
    readTime: "12 min",
    date: "Feb 2025",
    featured: true,
    aiGenerated: true,
    content: `
# How We Reduced AI Service Deployment Time by 99.5%

Deploying a new ML inference service from scratch took two weeks on my previous team. Not two weeks of actual work, two weeks of waiting: waiting for infrastructure provisioning, waiting for code reviews on manually written Terraform, waiting for Helm chart configurations, waiting for deployment pipelines to be wired up.

Six months later, new services shipped in under 30 minutes.

## The Problem

Each new AI service needed:
- Kubernetes namespace and RBAC configuration
- Terraform for AWS infrastructure (EKS node groups, IAM roles, S3 buckets)
- Helm chart with service-specific values
- CI/CD pipeline configuration
- Monitoring setup (Prometheus, Grafana, Loki)
- Load balancer and ingress configuration
- Secrets management

Every service was slightly different. Every engineer approached the setup differently. The result was a collection of manually maintained configurations drifting over time, requiring deep institutional knowledge to modify safely.

## The Solution: A Generation CLI

We built an internal CLI tool taking a service spec, a simple YAML file, and generating all of the above, production-grade and review-ready.

\`\`\`yaml
# service.yaml
name: recommendation-engine
type: inference  # inference | batch | streaming
model:
  framework: pytorch
  serving: torchserve
  gpu: true
  replicas: 3
resources:
  cpu: "4"
  memory: "16Gi"
  gpu: "1"
scaling:
  min: 2
  max: 10
  metric: latency_p95
  target: 200ms
monitoring:
  alerts:
    - latency_p99 > 500ms
    - error_rate > 0.01
\`\`\`

From this spec, the CLI generates:

1. Terraform modules: EKS node group with the right instance type (GPU-aware), IAM roles with least-privilege, S3 bucket for model artifacts
2. Helm chart: all service-specific values filled in, resource limits set, health checks configured
3. GitHub Actions workflow: build, test, push to ECR, deploy to staging, canary to prod
4. Grafana dashboard: pre-built with standard ML service metrics
5. A PR: fully-formed with all generated files, ready for a human to review and merge

The key design choice: the CLI generates human-readable, modifiable code, not an abstraction on top of Terraform and Helm. Engineers read and understand everything the CLI produces.

## The Numbers

| Metric | Before | After |
|--------|--------|-------|
| Time to first deployment | 2 weeks | 28 minutes |
| Infrastructure configuration errors | ~3 per service | ~0 |
| Configuration drift incidents | Weekly | Zero in 6 months |
| Engineer hours per deployment | ~40 | ~1 |

## What We Learned

**Generate code, not abstractions.** We tried building a custom DSL on top of Terraform and Helm. Debugging failures was a nightmare. Generating standard Terraform and Helm anyone on the team reads made the output trustworthy.

**Consistency compounds.** After rollout, monitoring dashboards became genuinely useful because every service exported the same metrics in the same format. Alert rules worked across services. On-call became dramatically easier.

**The hardest part was edge cases.** The spec handles 80% of services. The other 20% needed custom configuration. We built an escape hatch: engineers override any generated file. The default path stays the fast path.
    `,
  },
  {
    slug: "go-for-real-time-systems",
    title: "Why I Chose Go for a 10,000-Vehicle Real-Time Telematics System",
    excerpt: "When you are processing telemetry from 10,000+ vehicles every 30 seconds with strict SLA guarantees, language choice matters. Here is the case for Go.",
    tags: ["Go", "Real-time Systems", "Distributed Systems"],
    readTime: "7 min",
    date: "Dec 2024",
    featured: false,
    aiGenerated: true,
    content: `
# Why I Chose Go for a 10,000-Vehicle Real-Time Telematics System

A client hired me to architect their fleet telematics platform. Before picking a database, cloud provider, or system architecture, I had to pick a language.

The requirements: 10,000+ vehicles sending telemetry every 30 seconds, real-time anomaly detection, WebSocket connections for live dashboards, gRPC for inter-service communication, and strict SLA guarantees. The wrong language choice is a performance ceiling you hit in six months and spend the next year fighting.

I chose Go.

## Goroutines vs Threads vs Async

At 10,000 vehicles sending 2 updates per minute, the sustained load is around 333 events per second, with spikes well above.

Each event needs to:
1. Be received over MQTT or WebSocket
2. Be validated and parsed
3. Be written to PostgreSQL
4. Be checked against geofence rules
5. Be scored for anomaly likelihood
6. Potentially be written to Redis for the real-time dashboard
7. Potentially be sent to an alert queue

You need real concurrency for this. The options:

**Python asyncio:** Works for I/O-bound tasks but the GIL prevents parallelizing CPU-bound work without multiprocessing, which adds significant complexity and memory overhead.

**Node.js:** Good for I/O-bound concurrency, poor for CPU-intensive computation. Anomaly detection scoring needs real computation.

**Java or JVM:** Excellent concurrency model. But startup time, memory footprint, and operational complexity for a small team made the calculus harder.

**Go:** Goroutines are multiplexed over OS threads by the runtime. Spawning 10,000 goroutines (one per vehicle connection) uses roughly 80KB of memory each, so 800MB for 10,000 connections. JVM threads run about 1MB each, so roughly 10GB. The math is clear.

## The MQTT Architecture

Each vehicle publishes telemetry to an MQTT topic: \`vehicles/{vehicle_id}/telemetry\`.

The ingestion service spawns a goroutine per subscription:

\`\`\`go
func (s *IngestionService) StartConsumer(ctx context.Context) error {
    for {
        select {
        case msg := <-s.mqttClient.Messages():
            go s.processTelemetry(ctx, msg)
        case <-ctx.Done():
            return ctx.Err()
        }
    }
}
\`\`\`

Each processTelemetry call runs in its own goroutine. Go's scheduler handles the concurrency.

## gRPC for Inter-Service Communication

The platform has four services:
- Ingestion: receives MQTT messages
- Storage: writes to PostgreSQL and Redis
- Analytics: real-time anomaly detection
- Dashboard: WebSocket server for operator UIs

gRPC in Go is first-class. Service definitions live in protobuf, code generation is automatic, and the performance characteristics hold up at this volume.

\`\`\`protobuf
service TelemetryService {
  rpc IngestReading (TelemetryReading) returns (IngestResponse);
  rpc StreamVehicleState (VehicleStateRequest) returns (stream VehicleState);
}
\`\`\`

The StreamVehicleState RPC powers the live dashboard. The dashboard service opens a long-lived gRPC stream per vehicle being monitored, and the storage service pushes state updates as they arrive.

## What I Would Change

Go's strength for this type of system is real. The one friction point: anomaly detection scoring needed more sophisticated ML than Go expressed cleanly without calling out to a Python service. We ended up with a thin Go-to-Python gRPC call for ML scoring, which added a round-trip but kept both languages in their sweet spots.

Starting over, I would use the same approach. The difference: design the ML service interface from day one rather than retrofitting.
    `,
  },
  {
    slug: "from-spark-to-snowflake-ray",
    title: "Migrating ML Pipelines from Spark to Snowflake + Ray: A 360x Improvement",
    excerpt: "We had a pipeline taking 4 hours on Spark and Kubeflow. After migrating to Snowflake and Ray on Anyscale, the same pipeline runs in 40 seconds. Here is what the migration looked like.",
    tags: ["ML Infrastructure", "Snowflake", "Ray", "Data Engineering"],
    readTime: "9 min",
    date: "Nov 2024",
    featured: false,
    aiGenerated: true,
    content: `
# Migrating ML Pipelines from Spark to Snowflake + Ray: A 360x Improvement

My previous team inherited a set of ML feature engineering pipelines running on Spark via Kubeflow. They worked, when they finished. The problem: a full pipeline run took 4 hours. Nightly batch jobs regularly missed their windows. Engineers took days to iterate on features. On-call incidents often meant someone manually babysitting a stuck Spark job at 2 AM.

We migrated to Snowflake for the data transformation layer and Ray on Anyscale for the ML compute. The same pipeline now runs in 40 seconds.

## Why 4 Hours Was Unavoidable on Spark

The pipeline had three phases:

1. **Feature extraction (about 2 hours):** SQL-like transformations on large feature tables. Spark's shuffle-heavy operations on our data distribution were the bottleneck.
2. **Model feature computation (about 1 hour):** Python UDFs calling into our ML feature library. Spark's Python UDF execution is famously slow because of serialization overhead between the JVM and Python.
3. **Validation (about 1 hour):** Data quality checks, schema validation, and statistical tests.

Spark was the wrong tool for phases 2 and 3. It was acceptable for phase 1, but we paid the Spark tax on everything.

## Snowflake for Data Transformation

Phase 1 moved to Snowflake almost verbatim. Our SQL transformations ran faster for three reasons:

- **Auto-scaling compute:** Snowflake scales compute warehouses based on query complexity. No manual cluster sizing.
- **Column store and micro-partitioning:** Our queries filtered heavily on a few columns. Snowflake's columnar storage eliminated massive amounts of I/O.
- **No shuffle:** Snowflake's query optimizer handles data distribution transparently.

Phase 1 dropped from 2 hours to under 2 minutes.

## Ray for ML Compute

For phases 2 and 3, the Python-heavy ML work, we used Ray.

Ray was designed for Python-native distributed computing. No JVM, no serialization overhead, no UDF performance cliff.

\`\`\`python
import ray
from ray import data as rd

@ray.remote
def compute_features(batch: dict) -> dict:
    return feature_library.compute(batch)

ds = rd.read_parquet("s3://features/raw/")
result = ds.map_batches(compute_features, batch_size=1000)
\`\`\`

Ray's map_batches distributes computation across workers transparently. Anyscale handles cluster management, scaling workers up during feature computation and down when idle.

## The Migration Journey

**Weeks 1-2:** Migrate Phase 1 to Snowflake. Validate outputs match exactly. Ship to production.

**Week 3:** Rewrite Phase 2 as Ray jobs. More work than expected. Code assuming PySpark DataFrames had to be refactored to work with pandas and Ray datasets.

**Week 4:** Migrate Phase 3 validation. Much easier. Our validators were pure Python functions.

**Weeks 5-6:** Hardening. Add observability using Ray's built-in dashboard and custom Prometheus metrics. Set up Anyscale cluster autoscaling policies. Integrate with existing alert infrastructure.

## Numbers

| Phase | Before | After | Improvement |
|-------|--------|-------|-------------|
| Feature extraction | 2 hours | 90 seconds | 80x |
| ML feature computation | 1 hour | 20 seconds | 180x |
| Validation | 1 hour | 10 seconds | 360x |
| Total | 4 hours | ~2 minutes | ~120x |

The 360x in the title refers to the validation phase specifically. The end-to-end pipeline improved about 120x overall.

## What We Gave Up

Spark has a large ecosystem. A few things we left behind:

- **MLflow integration:** Spark's MLlib has native MLflow support. Wiring up Ray and MLflow required manual work.
- **Unified compute model:** Spark handles SQL and Python in one framework, badly. Now we maintain two systems.
- **Institutional knowledge:** The team knew Spark. Ray had a learning curve.

For our workload, the tradeoffs were clear. If your pipeline is SQL-heavy and Python UDFs are rare, Spark is fine. We were in the wrong place on the spectrum.
    `,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

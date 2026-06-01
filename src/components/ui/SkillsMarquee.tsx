const allSkills = [
  "Python", "Go", "FastAPI", "Google ADK", "Gemini", "GPT-4o",
  "LangChain", "LangGraph", "RAG Pipelines", "pgvector", "FAISS",
  "Kubernetes", "Docker", "Terraform", "GCP", "Vertex AI", "AWS",
  "Ray Serve", "Snowflake", "Kafka", "Redis", "gRPC", "WebSockets",
  "Prometheus", "Grafana", "Multi-agent Orchestration", "PostgreSQL",
  "FastAPI", "Pydantic", "AsyncIO", "Anyscale", "LLaMA", "MQTT",
];

const doubled = [...allSkills, ...allSkills];

export default function SkillsMarquee() {
  return (
    <div className="relative overflow-hidden py-4 border-y border-base-300 bg-base-200/60">
      {/* fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-base-200/60 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-base-200/60 to-transparent" />

      <div className="flex w-max animate-marquee gap-3">
        {doubled.map((skill, i) => (
          <span
            key={i}
            className="badge badge-ghost border border-base-300 badge-md shrink-0 text-base-content/60 font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

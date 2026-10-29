import { Star, GitFork, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import { Reveal, LineReveal } from "@/components/motion/Reveal";


const pinnedRepos = [
  {
    name: "tailwise",
    description: "An open-source Go engine that decides which LLM agent traces are worth keeping for review. Each trace is scored by a decision model on whether the final answer looks wrong, a keep/drop policy picks the ones to keep, and those are exported over OTLP to Phoenix, Langfuse or any OpenTelemetry back end, each with a plain-English reason. Takes traces over OTLP or a JSON API, queues them in NATS JetStream with retries and dead-letter streams, and ships as a single binary.",
    tags: ["Go", "OpenTelemetry", "NATS JetStream", "LLM Observability", "AI Agents"],
    stars: 0,
    forks: 0,
    status: "Active",
    featured: true,
    href: "https://github.com/tecnosam/tailwise",
    demoHref: "https://tailwise.samuelabolo.dev",
  },
  {
    name: "paperkite",
    description: "An Electron-based browser with a chat panel built into every tab. Every URL hashes into a room, so anyone viewing the same page can talk in real time - no accounts, no invites. Ships with AI agent integration (Claude, GPT, Gemini, local Ollama) over MCP, plus Whisper-powered audio and page translation, backed by a self-hostable Go chat service.",
    tags: ["Electron", "TypeScript", "Go", "gRPC", "AI Agents", "MCP"],
    stars: 0,
    forks: 0,
    status: "Active",
    featured: false,
    href: "https://github.com/tecnosam/paperkite",
    demoHref: "https://paperkite.samuelabolo.dev",
  },
  {
    name: "pydongo",
    description: "A lightweight ORM for MongoDB using Pydantic models. Makes working with MongoDB in Python feel as natural as a typed ORM - schema validation, model serialization, and query building out of the box.",
    tags: ["Python", "MongoDB", "ORM", "Pydantic"],
    stars: 33,
    forks: 6,
    status: "Active",
    featured: false,
    href: "https://github.com/tecnosam/pydongo",
  },
  {
    name: "voicebox",
    description: "Open-source Python tool for voice calls and messaging over LAN. Built on top of the TCP/IP protocol - peer-to-peer audio streaming and text messaging without a central server.",
    tags: ["Python", "TCP", "Networking", "Audio"],
    stars: 7,
    forks: 2,
    status: "Active",
    featured: false,
    href: "https://github.com/tecnosam/voicebox",
  },
  {
    name: "teasr",
    description: "A Brainf*ck compiler implementation written in C. A low-level systems programming exercise - lexing, parsing, and code generation for an esoteric language.",
    tags: ["C", "Compiler", "Systems Programming"],
    stars: 0,
    forks: 0,
    status: "Learning",
    featured: false,
    href: "https://github.com/tecnosam/teasr",
  },
  {
    name: "gdsc-wrapped",
    description: "NLP analysis of messages in Google Developer Student Club community forums. Uses natural language processing to extract insights and trends from community discussions.",
    tags: ["Python", "NLP", "Jupyter Notebook", "Data Analysis"],
    stars: 3,
    forks: 0,
    status: "Archived",
    featured: false,
    href: "https://github.com/tecnosam/gdsc-wrapped",
  },
  {
    name: "golang-service-cookiecutter",
    description: "An opinionated Go microservice template - batteries-included scaffolding with project structure, Dockerfile, Makefile, and CI/CD config baked in so new services start production-ready.",
    tags: ["Go", "Microservices", "Templates", "DevOps"],
    stars: 0,
    forks: 0,
    status: "WIP",
    featured: false,
    href: "https://github.com/tecnosam/golang-service-cookiecutter",
  },
];


const statusStyle: Record<string, string> = {
  Active:   "text-success",
  Deployed: "text-info",
  Article:  "text-primary",
  Archived: "text-base-content/40",
  Learning: "text-warning",
  WIP:      "text-warning",
};

const stats = [
  { icon: <GithubIcon size={14} />, value: "60+", label: "Repositories" },
  { icon: <ArrowUpRight size={14} />, value: "108", label: "Followers" },
  { icon: <Star size={14} />, value: "45+", label: "Stars earned" },
];

function Status({ status }: { status: string }) {
  return (
    <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${statusStyle[status]}`}>
      <span className="size-1.5 rounded-full bg-current" /> {status}
    </span>
  );
}

export default function OpenSourcePage() {
  const featured = pinnedRepos.filter((r) => r.featured);
  const pinned = pinnedRepos.filter((r) => !r.featured);

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 pt-16 pb-28 md:pt-24 md:pb-36">
      <header className="mb-20 md:mb-28 grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <Reveal><p className="eyebrow mb-6">Portfolio · Open source</p></Reveal>
          <h1 className="text-[clamp(3.5rem,10vw,9rem)] font-light leading-[0.9] tracking-[-0.045em]">
            <LineReveal lines={["Shipped", <span key="p" className="text-base-content/40">in public.</span>]} />
          </h1>
        </div>
        <Reveal delay={0.3} className="md:col-span-4">
          <p className="text-base leading-relaxed text-base-content/55">
            Here are the projects I&apos;ve shipped publicly, from production tools to systems programming exercises.
          </p>
        </Reveal>
      </header>

      {/* Stats */}
      <Reveal className="mb-20 md:mb-28 grid grid-cols-3 border-y hairline">
        {stats.map((s, i) => (
          <div key={s.label} className={`py-7 ${i > 0 ? "border-l hairline pl-5 md:pl-8" : ""}`}>
            <p className="font-display text-4xl md:text-6xl font-light tracking-[-0.04em] leading-none">{s.value}</p>
            <p className="mt-3 flex items-center gap-2 eyebrow"><span className="text-primary">{s.icon}</span> {s.label}</p>
          </div>
        ))}
      </Reveal>

      {/* Featured */}
      <section className="mb-24 md:mb-32">
        <Reveal><p className="eyebrow mb-6">Featured project</p></Reveal>
        {featured.map((repo) => (
          <Reveal key={repo.name}>
            <article className="relative overflow-hidden rounded-3xl border hairline bg-base-200/60 p-7 md:p-12">
              <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-primary/10 blur-[120px]" />
              <div className="relative grid gap-10 md:grid-cols-12">
                <div className="md:col-span-7">
                  <div className="mb-6 flex items-center gap-5">
                    <Status status={repo.status} />
                    <span className="flex items-center gap-1 font-mono text-xs text-base-content/40"><Star size={12} /> {repo.stars}</span>
                    <span className="flex items-center gap-1 font-mono text-xs text-base-content/40"><GitFork size={12} /> {repo.forks}</span>
                  </div>
                  <h2 className="text-[clamp(3rem,8vw,7rem)] font-light leading-[0.9] tracking-[-0.045em]">{repo.name}</h2>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {repo.demoHref && (
                      <a href={repo.demoHref} target="_blank" rel="noopener noreferrer" data-cursor="Visit" className="btn btn-primary gap-2">
                        Visit site <ArrowUpRight size={16} />
                      </a>
                    )}
                    <a href={repo.href} target="_blank" rel="noopener noreferrer" className="btn btn-outline border-base-content/20 gap-2">
                      <GithubIcon size={15} /> View on GitHub
                    </a>
                  </div>
                </div>
                <div className="md:col-span-5 md:pt-12">
                  <p className="text-base md:text-lg leading-relaxed text-base-content/65">{repo.description}</p>
                  <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-base-content/40">
                    {repo.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      {/* Pinned */}
      <section className="mb-24 md:mb-32">
        <Reveal><p className="eyebrow mb-6">Pinned repositories</p></Reveal>
        <div className="grid gap-px overflow-hidden rounded-3xl border hairline bg-base-content/10 md:grid-cols-2">
          {pinned.map((repo, i) => (
            <Reveal key={repo.name} delay={(i % 2) * 0.08} y={16} className="bg-base-100">
              <a
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Code"
                className="group flex h-full flex-col p-7 md:p-9 transition-colors duration-500 hover:bg-base-200/70"
              >
                <div className="flex items-center justify-between gap-4">
                  <Status status={repo.status} />
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-1 font-mono text-xs text-base-content/40"><Star size={12} /> {repo.stars}</span>
                  )}
                </div>
                <h3 className="mt-10 font-display text-3xl md:text-4xl font-light tracking-tight transition-colors duration-500 group-hover:text-primary">
                  {repo.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-base-content/50">{repo.description}</p>
                <div className="mt-auto flex items-end justify-between gap-6 pt-8">
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-base-content/35">
                    {repo.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <ArrowUpRight size={20} className="shrink-0 text-base-content/30 transition-all duration-700 ease-out-expo group-hover:rotate-45 group-hover:text-primary" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Reveal className="flex flex-col items-center gap-6 text-center">
        <p className="font-display text-3xl md:text-5xl font-light tracking-tight">
          60+ public repos <span className="text-base-content/40">on GitHub</span>
        </p>
        <a href="https://github.com/tecnosam" target="_blank" rel="noopener noreferrer" className="btn btn-outline border-base-content/20 gap-2">
          <GithubIcon size={16} /> github.com/tecnosam
        </a>
      </Reveal>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/home/Hero";
import Portrait from "@/components/home/Portrait";
import WorkList, { type Work } from "@/components/home/WorkList";
import ExperienceList from "@/components/home/ExperienceList";
import ToolGrid from "@/components/home/ToolGrid";
import ScrollWords from "@/components/motion/ScrollWords";
import VelocityMarquee from "@/components/motion/VelocityMarquee";
import Counter from "@/components/motion/Counter";
import Magnetic from "@/components/motion/Magnetic";
import { Reveal, LineReveal } from "@/components/motion/Reveal";
import DownloadResumeLink from "@/components/ui/DownloadResumeLink";
import { profile, skills, experience } from "@/lib/data";

const featuredProjects: Work[] = [
  {
    name: "Tailwise",
    description: "An open-source engine that scores LLM agent traces and keeps the ones where the final answer looks wrong. Kept traces go to Phoenix, Langfuse or any OpenTelemetry back end, each with a one-line reason.",
    tags: ["Go", "OpenTelemetry", "NATS", "LLM Observability"],
    stars: 0,
    href: "https://github.com/tecnosam/tailwise",
    demoHref: "https://tailwise.samuelabolo.dev",
  },
  {
    name: "Paperkite",
    description: "An Electron browser with a chat room built into every tab. Two people on the same page talk in real time, with no call and no invite. The build includes AI agent support over MCP and a self-hosted Go backend.",
    tags: ["Electron", "TypeScript", "Go", "MCP"],
    stars: 0,
    href: "https://github.com/tecnosam/paperkite",
    demoHref: "https://paperkite.samuelabolo.dev",
  },
  {
    name: "pydongo",
    description: "A Pydantic-based ORM for MongoDB. Typed models, schema validation, and query building, without dropping into raw driver calls.",
    tags: ["Python", "MongoDB", "ORM", "Pydantic"],
    stars: 33,
    href: "https://github.com/tecnosam/pydongo",
    demoHref: null,
  },
];

const stats = [
  { value: 360, suffix: "×", label: "faster ML pipeline queries", note: "TripAdvisor · 4 h → 40 s" },
  { value: 90, suffix: "%", label: "lower AI inference latency", note: "TripAdvisor · 15 min → 62 s" },
  { value: 99.5, decimals: 1, suffix: "%", label: "less time to deploy AI services", note: "2 weeks → 30 min" },
  { value: 10000, suffix: "+", label: "vehicles tracked in real time", note: "NovaTrack · Go, MQTT, gRPC" },
];

const marqueeTop = ["Multi-agent systems", "RAG pipelines", "Distributed backends", "Model serving", "MLOps", "Real-time telemetry"];
const marqueeBottom = ["Python", "Go", "Kubernetes", "Gemini", "pgvector", "Ray", "Snowflake", "Kafka", "gRPC", "Terraform", "FastAPI", "PyTorch"];

const intro =
  "Five years shipping machine learning, AI systems and distributed backends. I've made ML pipelines [[360× faster,]] cut inference latency by [[90%,]] and taken deployments from [[two weeks to thirty minutes.]] I do my best work where correctness meets scale.";

function SectionHead({ index, eyebrow, title, aside }: { index: string; eyebrow: string; title: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-14 md:mb-20 flex flex-wrap items-end justify-between gap-6">
      <div>
        <Reveal><p className="eyebrow mb-5">({index}) {eyebrow}</p></Reveal>
        <h2 className="text-[clamp(2.4rem,5.5vw,4.75rem)] font-light leading-[1] tracking-[-0.035em]">
          <LineReveal inView lines={Array.isArray(title) ? title : [title]} />
        </h2>
      </div>
      {aside && <Reveal delay={0.2}>{aside}</Reveal>}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-clip">
      <Hero />

      {/* ── About ── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-28 md:py-44">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <Reveal><p className="eyebrow mb-6">(01) About</p></Reveal>
            <div className="max-w-xs md:max-w-none md:sticky md:top-28">
              <Portrait />
              <div className="mt-5 flex justify-between eyebrow">
                <span>{profile.location}</span>
                <span>{profile.openTo}</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-8 md:pt-14">
            <ScrollWords
              text={intro}
              className="font-display text-[clamp(1.9rem,3.7vw,3.5rem)] font-light leading-[1.14] tracking-[-0.02em]"
            />
            <Reveal className="mt-14 grid gap-8 sm:grid-cols-2 max-w-2xl">
              <p className="text-base leading-relaxed text-base-content/55">
                Right now I&apos;m architecting multi-agent orchestration on Vertex AI and Gemini at Boostr. Before that I
                built AI platform tooling at TripAdvisor, real-time telematics in Go, and pricing models in TensorFlow.
              </p>
              <p className="text-base leading-relaxed text-base-content/55">
                I&apos;m comfortable anywhere from training a model to owning the Kubernetes it runs on, and I
                care about the parts most people skip: evals, observability and cost.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Numbers */}
        <div className="mt-28 md:mt-40 grid grid-cols-2 lg:grid-cols-4 border-t hairline">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className={`py-8 pr-4 ${i % 2 ? "pl-5 border-l hairline" : ""} ${i > 1 ? "border-t hairline lg:border-t-0" : ""} lg:pl-6 lg:first:pl-0 ${i > 0 ? "lg:border-l" : ""}`}
            >
              <p className="font-display font-light tracking-[-0.04em] leading-none text-[clamp(2.75rem,5.5vw,5rem)]">
                <Counter value={s.value} decimals={s.decimals} />
                <span className="text-primary">{s.suffix}</span>
              </p>
              <p className="mt-4 text-sm text-base-content/65">{s.label}</p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-base-content/35">{s.note}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Selected work ── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-28 md:pb-40">
        <SectionHead
          index="02"
          eyebrow="Selected work"
          title={["Built in the open"]}
          aside={
            <Link href="/open-source" className="group flex items-center gap-2 text-sm text-base-content/60 transition-colors hover:text-primary">
              All projects <ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          }
        />
        <WorkList items={featuredProjects} />
      </section>

      {/* ── Marquee + stack ── */}
      <section className="border-y hairline py-10 md:py-14">
        <VelocityMarquee
          items={marqueeTop}
          baseVelocity={-1.6}
          className="font-display text-[clamp(3rem,8vw,7.5rem)] font-light leading-[1.05] tracking-[-0.03em]"
        />
        <VelocityMarquee
          items={marqueeBottom}
          baseVelocity={1.6}
          className="text-outline font-display text-[clamp(3rem,8vw,7.5rem)] font-light leading-[1.05] tracking-[-0.03em]"
        />
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-32">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <Reveal key={group.category} delay={(i % 3) * 0.08}>
              <p className="eyebrow mb-4 flex items-center gap-3">
                <span className="text-primary">0{i + 1}</span> {group.category}
              </p>
              <p className="text-base leading-[1.9] text-base-content/60">
                {group.items.join(" / ")}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-28 md:pb-40">
        <SectionHead
          index="03"
          eyebrow="Experience"
          title={["Where I've been", <span key="s" className="text-base-content/40">shipping</span>]}
          aside={<DownloadResumeLink source="experience" variant="link">View resume</DownloadResumeLink>}
        />
        <ExperienceList roles={experience} />
      </section>

      {/* ── AI tools ── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-28 md:pb-40">
        <SectionHead
          index="04"
          eyebrow="Interactive"
          title={["Don't just read about me.", <span key="a" className="text-primary">Ask.</span>]}
          aside={
            <p className="max-w-xs text-sm leading-relaxed text-base-content/50">
              Four AI tools that know my full background and answer the question you actually came with.
            </p>
          }
        />
        <ToolGrid />
      </section>

      {/* ── Contact ── */}
      <section className="relative overflow-hidden border-t hairline">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-full size-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8 py-32 md:py-48 text-center">
          <Reveal><p className="eyebrow mb-8">(05) Contact</p></Reveal>
          <h2 className="mx-auto max-w-5xl text-[clamp(3rem,8.5vw,8rem)] font-light leading-[0.95] tracking-[-0.045em]">
            <LineReveal inView lines={["Let's build something", <span key="t" className="text-base-content/40">that ships.</span>]} />
          </h2>
          <Reveal delay={0.3} className="mt-14 flex flex-col items-center gap-8">
            <Magnetic strength={0.45}>
              <Link
                href="/contact"
                data-cursor="Hello"
                className="flex size-40 md:size-44 items-center justify-center rounded-full bg-primary text-primary-content text-lg font-medium transition-transform duration-700 ease-out-expo hover:scale-105"
              >
                Say hello
              </Link>
            </Magnetic>
            <a href={`mailto:${profile.email}`} className="font-mono text-sm text-base-content/50 transition-colors hover:text-primary">
              {profile.email}
            </a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

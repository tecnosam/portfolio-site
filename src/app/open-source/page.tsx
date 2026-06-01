import { Star, GitFork, GitCommit, Users, ExternalLink } from "lucide-react";
// GitCommit and Users used in stats strip
import { GithubIcon } from "@/components/ui/SocialIcons";

const pinnedRepos = [
  {
    name: "pydongo",
    description: "A lightweight ORM for MongoDB using Pydantic models. Makes working with MongoDB in Python feel as natural as a typed ORM - schema validation, model serialization, and query building out of the box.",
    tags: ["Python", "MongoDB", "ORM", "Pydantic"],
    stars: 33,
    forks: 6,
    status: "Active",
    featured: true,
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
  Active:   "badge-success badge-soft",
  Deployed: "badge-info badge-soft",
  Article:  "badge-primary badge-soft",
  Archived: "badge-ghost border border-base-300",
  Learning: "badge-warning badge-soft",
  WIP:      "badge-warning badge-soft",
};

export default function OpenSourcePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Portfolio</p>
        <h1 className="text-5xl font-black text-base-content mb-3">Open Source</h1>
        <p className="text-base-content/50 max-w-xl text-base leading-relaxed">
          134 repositories, 410 contributions in the last year. Here are the projects I&apos;ve shipped publicly - from production tools to systems programming exercises.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-14">
        {[
          { icon: <GithubIcon size={16} />, value: "134",  label: "Repositories" },
          { icon: <Users size={16} />,     value: "108",  label: "Followers" },
          { icon: <Star size={16} />,      value: "45+",  label: "Stars earned" },
        ].map((s) => (
          <div key={s.label} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4 flex-row items-center gap-3">
              <div className="text-primary">{s.icon}</div>
              <div>
                <p className="font-black text-base-content text-xl leading-none">{s.value}</p>
                <p className="text-base-content/40 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured */}
      <section className="mb-14">
        <h2 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-5 flex items-center gap-2">
          <Star size={13} /> Featured Project
        </h2>
        {pinnedRepos.filter(r => r.featured).map((repo) => (
          <a
            key={repo.name}
            href={repo.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card bg-base-100 border-2 border-primary/20 shadow-sm card-lift block"
          >
            <div className="card-body p-7">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <GithubIcon size={18} className="text-base-content/40" />
                  <h3 className="font-black text-base-content text-2xl">{repo.name}</h3>
                  <span className={`badge badge-sm ${statusStyle[repo.status]}`}>{repo.status}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-base-content/50">
                  <span className="flex items-center gap-1 font-bold">
                    <Star size={15} className="text-warning" /> {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={14} /> {repo.forks}
                  </span>
                  <ExternalLink size={14} />
                </div>
              </div>
              <p className="text-base-content/60 text-base leading-relaxed mb-4">{repo.description}</p>
              <div className="flex flex-wrap gap-2">
                {repo.tags.map((tag) => (
                  <span key={tag} className="badge badge-ghost border border-base-300 badge-md text-base-content/60">{tag}</span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </section>

      {/* Pinned */}
      <section className="mb-14">
        <h2 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-5 flex items-center gap-2">
          <GithubIcon size={13} /> Pinned Repositories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pinnedRepos.filter(r => !r.featured).map((repo) => (
            <a
              key={repo.name}
              href={repo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card bg-base-100 border border-base-300 shadow-sm card-lift block"
            >
              <div className="card-body p-5">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <GithubIcon size={14} className="text-base-content/30 flex-shrink-0" />
                    <h3 className="font-bold text-base-content text-base truncate">{repo.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge badge-xs ${statusStyle[repo.status]}`}>{repo.status}</span>
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-base-content/40">
                        <Star size={11} /> {repo.stars}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-base-content/55 text-sm leading-relaxed mb-3">{repo.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {repo.tags.map((tag) => (
                    <span key={tag} className="badge badge-ghost badge-sm border border-base-300 text-base-content/50">{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="card bg-base-200 border border-base-300 text-center">
        <div className="card-body p-8 gap-4">
          <p className="text-base-content/60 text-base">60+ Public repos on GitHub</p>
          <div>
            <a
              href="https://github.com/tecnosam"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-md gap-2"
            >
              <GithubIcon size={16} /> github.com/tecnosam
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

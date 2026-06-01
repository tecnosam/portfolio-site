import Image from "next/image";
import Link from "next/link";
import { Users, GraduationCap } from "lucide-react";

const communities = [
  {
    name: "Google Developer Groups (GDG) Nigeria",
    role: "Member",
    description: "Active participant in GDG Nigeria events focused on AI/ML, backend systems, and distributed computing with the local developer community.",
    impact: "Active contributor to the Nigerian tech ecosystem",
    year: "2022 – Present",
    type: "community",
  },
  {
    name: "Google ML Bootcamp 2022",
    role: "Selected Participant",
    description: "Selected among the top Sub-Saharan African candidates for the Google ML Bootcamp. Completed Deep Learning and TensorFlow Specializations with top marks.",
    impact: "Top selection across Sub-Saharan Africa",
    year: "2022",
    type: "program",
  },
  {
    name: "Andela Network",
    role: "Software Engineer",
    description: "Part of Andela's network of top African tech talent, connected with engineers across the continent building impactful products for global companies.",
    impact: "2 years in network, placed with top-tier US companies",
    year: "2022 – 2024",
    type: "community",
  },
];

// const speakingEvents = [
//   {
//     title: "Building Production Agentic AI Systems",
//     event: "Twitter Space / Tech Event",
//     description: "Spoke about lessons learned building multi-agent orchestration pipelines in production - tool-calling, structured outputs, and confidence thresholds for human-in-the-loop systems.",
//     year: "2025",
//     image: "/sam-pictures/event-speaker-flier.jpeg",
//   },
//   {
//     title: "AI in Backend Engineering: From Hype to Production",
//     event: "Community Tech Talk",
//     description: "Deep-dive into shipping LLM-powered features in production - RAG architecture, latency optimization, and cost-aware deployment patterns.",
//     year: "2025",
//     image: "/sam-pictures/event-speaker-flier-twitter-space-2.jpeg",
//   },
// ];

const universityActivities = [
  {
    institution: "Babcock University",
    period: "2021 – 2024",
    roles: [
      { org: "BUCC", title: "Lead Developer", year: "23/24" },
      { org: "BUCC", title: "Software Engineering Senator", year: "22/23" },
      { org: "BUCC", title: "Lead Backend Developer", year: "22/23" },
      { org: "Google Developer Students Club", title: "Technical Lead", year: "23/24" },
      { org: "Google Developer Students Club", title: "Data Science Lead", year: "23/24" },
      { org: "Google Developer Students Club", title: "Web Development Co-lead", year: "22/23" },
      { org: "Enactus", title: "Technical Lead", year: "2021 – 2022" },
    ],
  },
  {
    institution: "Yeshua High School",
    period: "2017 – 2020",
    roles: [
      { org: "JETS Club", title: "Member", year: "2017 – 2020" },
      { org: "Programming Club", title: "Co-founder", year: "2019 – 2020" },
    ],
    note: "Co-founded the school's Programming Club to teach students Data Science with Python and Functional Programming with Scala.",
  },
];

export default function CommunitiesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Involvement</p>
        <h1 className="text-5xl font-black text-base-content mb-3">Communities</h1>
        <p className="text-base-content/50 max-w-xl text-base leading-relaxed">
          Building up the African tech ecosystem. Here&apos;s where I invest time outside of day-to-day engineering work - speaking, mentoring, connecting.
        </p>
      </div>

      {/* Speaking — temporarily hidden */}
      {/* <section className="mb-14">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-5 flex items-center gap-2">
          <Mic size={14} /> Speaking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {speakingEvents.map((event, i) => (
            <div key={i} className="card bg-base-100 border border-base-300 shadow-sm card-lift overflow-hidden">
              <figure className="relative h-52">
                <Image src={event.image} alt={event.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="badge badge-primary badge-soft badge-sm">{event.year}</span>
                </div>
              </figure>
              <div className="card-body p-5">
                <h3 className="card-title text-base text-base-content leading-snug">{event.title}</h3>
                <p className="text-primary text-xs font-medium">{event.event}</p>
                <p className="text-base-content/55 text-sm leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Communities */}
      <section className="mb-14">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-5 flex items-center gap-2">
          <Users size={14} /> Community Involvement
        </h2>
        <div className="space-y-4">
          {communities.map((c, i) => (
            <div key={i} className="card bg-base-100 border border-base-300 shadow-sm card-lift">
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-base-content text-sm">{c.name}</h3>
                      <span className={`badge badge-xs ${c.type === "program" ? "badge-primary badge-soft" : "badge-ghost border border-base-300"}`}>
                        {c.type === "program" ? "Program" : "Community"}
                      </span>
                    </div>
                    <p className="text-primary text-xs font-medium mb-0.5">{c.role}</p>
                    <p className="text-base-content/40 text-xs mb-2">{c.year}</p>
                    <p className="text-base-content/60 text-sm leading-relaxed mb-3">{c.description}</p>
                    <div className="badge badge-success badge-soft badge-sm">✓ {c.impact}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* University & School Activities */}
      <section className="mb-14">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-5 flex items-center gap-2">
          <GraduationCap size={14} /> University & School Activities
        </h2>
        <div className="space-y-5">
          {universityActivities.map((inst, i) => (
            <div key={i} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-base-content text-sm">{inst.institution}</h3>
                    <p className="text-base-content/40 text-xs mt-0.5">{inst.period}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {inst.roles.map((role, j) => (
                    <div key={j} className="flex items-center justify-between gap-3 py-2 border-b border-base-200 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="size-1.5 rounded-full bg-primary flex-shrink-0" />
                        <div>
                          <span className="text-sm text-base-content font-medium">{role.title}</span>
                          <span className="text-base-content/40 text-xs"> · {role.org}</span>
                        </div>
                      </div>
                      <span className="badge badge-ghost border border-base-300 badge-xs text-base-content/40 flex-shrink-0">{role.year}</span>
                    </div>
                  ))}
                </div>
                {inst.note && (
                  <p className="text-base-content/50 text-xs leading-relaxed mt-3 italic">{inst.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Speaking CTA — temporarily hidden */}
      {/* <div className="card bg-primary text-primary-content shadow-sm">
        <div className="card-body p-8 text-center gap-3">
          <h3 className="font-bold text-lg">Want me to speak at your event?</h3>
          <p className="text-primary-content/70 text-sm">I speak about production AI systems, backend engineering at scale, and the African tech ecosystem.</p>
          <div>
            <Link
              href={`/contact?subject=${encodeURIComponent("Speaking Inquiry")}&message=${encodeURIComponent("Hi Sam,\n\nI'd love to have you speak at our event.\n\nEvent name:\nDate & format:\nAudience:\nTopic you have in mind:")}`}
              className="btn bg-white text-primary hover:bg-white/90 btn-sm"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div> */}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import DownloadResumeLink from "@/components/ui/DownloadResumeLink";
import {
  Mail, ArrowRight, MapPin,
  Sparkles, MessageSquare, FileSearch, Zap, HelpCircle,
  TrendingUp, Clock, BarChart3,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/SocialIcons";
import SkillsMarquee from "@/components/ui/SkillsMarquee";
import { profile, skills, experience } from "@/lib/data";

export default function HomePage() {
  const recentExperience = experience.slice(0, 3);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative">
        {/* Background layer — overflow-hidden here only so backgrounds stay contained
            while the floating photo badges can overflow outside the section freely */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="dot-grid absolute inset-0 opacity-60" />
          <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-primary/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-20 sm:pt-14 sm:pb-24">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* ── Left content ── */}
            <div className="flex-1 space-y-7 animate-fade-up">
              <div className="badge badge-success badge-soft gap-2 text-sm py-3 px-4">
                <span className="size-2 rounded-full bg-success animate-pulse-ring" />
                Available for new opportunities
              </div>

              <div>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-base-content leading-[0.92] mb-4">
                  Samuel<br />
                  <span className="gradient-text">Abolo</span>
                </h1>
                <p className="text-base-content/70 text-xl font-semibold mt-4">{profile.title}</p>
                <p className="text-base-content/40 text-base mt-1.5">{profile.subtitle}</p>
              </div>

              <p className="text-base-content/60 leading-relaxed max-w-lg text-base md:text-lg">
                {profile.tagline}
              </p>

              <div className="flex items-center gap-2 text-base text-base-content/40">
                <MapPin size={15} />
                <span>{profile.location}</span>
                <span className="text-primary mx-1">·</span>
                <span>{profile.openTo}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/contact" className="btn btn-primary gap-2">
                  Get in touch <ArrowRight size={16} />
                </Link>
                <DownloadResumeLink source="hero" />
              </div>

              <div className="flex items-center gap-1">
                {[
                  { href: profile.socials.github,   icon: <GithubIcon size={18} /> },
                  { href: profile.socials.linkedin, icon: <LinkedinIcon size={18} /> },
                  { href: profile.socials.twitter,  icon: <TwitterIcon size={18} /> },
                  { href: `mailto:${profile.email}`, icon: <Mail size={18} /> },
                ].map(({ href, icon }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                    className="btn btn-ghost btn-square text-base-content/35 hover:text-primary hover:bg-primary/8 transition-colors">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* ── Right: photo ── */}
            <div className="relative flex-shrink-0 animate-fade-up delay-200">
              {/* Decorative rings */}
              <div className="absolute -inset-4 rounded-3xl border-2 border-primary/10" />
              <div className="absolute -inset-8 rounded-3xl border border-primary/5" />
              {/* Photo */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[360px] md:h-[360px]">
                <Image
                  src="/sam-pictures/headshot.png"
                  alt="Samuel Abolo"
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                  priority
                />
              </div>
              {/* Floating badge - current role */}
              <div className="absolute -bottom-5 -left-3 sm:-bottom-6 sm:-left-6 animate-float">
                <div className="card bg-base-100 shadow-xl border border-base-300 px-3 py-2.5 sm:px-5 sm:py-3.5">
                  <p className="text-[10px] text-base-content/40 uppercase tracking-widest mb-0.5">Currently at</p>
                  <p className="text-sm sm:text-base font-black text-base-content">Boostr</p>
                  <p className="text-xs sm:text-sm text-primary font-medium">Agentic AI Platform</p>
                </div>
              </div>
              {/* Floating badge - years */}
              <div className="absolute -top-4 -right-3 sm:-top-5 sm:-right-5 animate-float" style={{ animationDelay: "2.5s" }}>
                <div className="card bg-primary text-primary-content shadow-xl px-3 py-2 sm:px-4 sm:py-3 text-center">
                  <p className="text-xl sm:text-2xl font-black leading-none">5+</p>
                  <p className="text-[10px] font-medium opacity-80 mt-0.5">Years Shipping<br />Production Systems</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skills Marquee ── */}
      <SkillsMarquee />

      {/* ── AI Features ── */}
      <section className="bg-base-200 border-b border-base-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-base-content mb-3">Explore Interactively</h2>
            <p className="text-base-content/50 text-base max-w-md mx-auto">
              This portfolio goes beyond static pages - use AI to interact with my profile in ways that actually matter to you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                href: "/jd-analyzer",
                icon: <FileSearch size={28} />,
                title: "JD Analyzer",
                desc: "Paste or upload any job description and get a 1–100 fit score, highlighted strengths, gap analysis, and a resume tailored to that exact role.",
                color: "text-primary",
                bg: "bg-base-100 hover:border-primary/30 hover:bg-primary/5",
                tag: "Most Popular",
              },
              {
                href: "/ask-sam",
                icon: <MessageSquare size={28} />,
                title: "Ask About Sam",
                desc: "Chat with an AI that knows my full background - skills, experience, projects, hobbies, and what I'm looking for next.",
                color: "text-info",
                bg: "bg-base-100 hover:border-info/30 hover:bg-info/5",
                tag: null,
              },
              {
                href: "/refer-me",
                icon: <Zap size={28} />,
                title: "Refer Me",
                desc: "Everything you need to write a strong referral. Enter a role or upload a JD and get a customized pitch, key strengths, and achievements.",
                color: "text-warning",
                bg: "bg-base-100 hover:border-warning/30 hover:bg-warning/5",
                tag: "AI Customized",
              },
              {
                href: "/how-can-i-help",
                icon: <HelpCircle size={28} />,
                title: "How Can I Help?",
                desc: "Share your business context and tech stack. Get a specific, honest breakdown of how Samuel Abolo can add value to your team.",
                color: "text-success",
                bg: "bg-base-100 hover:border-success/30 hover:bg-success/5",
                tag: null,
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`group card border border-base-300 shadow-sm ${item.bg} transition-all duration-200 card-lift`}>
                <div className="card-body p-6 md:p-8 gap-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-base-200 ${item.color}`}>{item.icon}</div>
                    {item.tag && <span className="badge badge-soft badge-sm text-base-content/50 border border-base-300">{item.tag}</span>}
                  </div>
                  <div>
                    <p className="font-black text-base-content text-xl mb-2">{item.title}</p>
                    <p className="text-base-content/55 text-base leading-relaxed">{item.desc}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Try it now <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Expertise</p>
          <h2 className="text-2xl sm:text-4xl font-black text-base-content">Skills &amp; Stack</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skills.map((sg) => (
            <div key={sg.category} className="card bg-base-100 border border-base-300 card-lift shadow-sm">
              <div className="card-body p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-2xl">{sg.icon}</span>
                    <h3 className="truncate font-black text-base-content text-lg">{sg.category}</h3>
                  </div>
                  <span className="badge badge-ghost shrink-0 whitespace-nowrap border border-base-300 text-base-content/40 text-xs">
                    {sg.items.length} skills
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sg.items.map((item) => (
                    <span key={item} className="badge badge-ghost border border-base-300 badge-md text-base-content/65 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="bg-base-200 border-t border-base-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Career</p>
              <h2 className="text-2xl sm:text-4xl font-black text-base-content">Experience</h2>
            </div>
            <DownloadResumeLink source="experience" variant="link">
              View Resume
            </DownloadResumeLink>
          </div>

          <div className="space-y-5">
            {recentExperience.map((exp, i) => (
              <div key={i}
                className={`card bg-base-100 border shadow-sm card-lift ${exp.current ? "border-primary/30" : "border-base-300"}`}>
                <div className="card-body p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="font-black text-base-content text-xl">{exp.company}</h3>
                        {exp.current && (
                          <div className="badge badge-success badge-soft gap-1.5">
                            <span className="size-1.5 rounded-full bg-success animate-pulse" />
                            Current
                          </div>
                        )}
                      </div>
                      <p className="text-primary font-bold text-base">{exp.role}</p>
                      <p className="text-base-content/45 text-sm mt-1">{exp.period} · {exp.location}</p>
                    </div>
                    <div className="text-3xl font-black text-base-content/6 select-none hidden md:block">
                      0{i + 1}
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {exp.highlights.slice(0, 3).map((h, j) => (
                      <li key={j} className="flex gap-3 text-base-content/65 text-base leading-relaxed">
                        <span className="text-primary mt-1 flex-shrink-0 font-bold">·</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

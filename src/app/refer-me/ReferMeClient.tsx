"use client";

import { useState, useRef } from "react";
import { Copy, Check, Loader2, Sparkles, Upload, FileText, X, Download, Mail, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { profile, experience, skills, education, certifications } from "@/lib/data";
import { LinkedinIcon } from "@/components/ui/SocialIcons";

const DEFAULT_PITCH = `Samuel ships production systems built for real load. At TripAdvisor, he cut AI deployment time from two weeks to 30 minutes and improved ML query runtimes 360x. He works across backend engineering, ML pipelines, and distributed infrastructure with equal depth in each. He's based in Lagos, open to relocation, and looking for senior engineering roles at US companies.`;

const DEFAULT_STRENGTHS = [
  "He leaves quantified results at every role: 360x faster queries, 90% lower inference latency, and deployment time cut from two weeks to 30 minutes.",
  "He writes Python and Go fluently and picks based on what the system needs.",
  "He designs distributed systems from scratch, event-driven and built for high throughput.",
  "He's taken ML models from training through RAG pipelines to production Kubernetes deployments.",
  "He's mentored PhD-level engineers and led cross-functional delivery without drama.",
  "He owns problems end-to-end, with on-call incident response experience at AI platforms serving real traffic.",
  "Five years of shipping across backend, ML infrastructure, and distributed systems, with depth in all three.",
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="btn btn-ghost btn-xs gap-1.5">
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

type CustomKit = {
  inferredRole: string;
  elevatorPitch: string;
  keyStrengths: string[];
  whyNow: string;
  topAchievements: { achievement: string; relevance: string }[];
  suggestedSubject: string;
  relevantExperience?: {
    company: string;
    role: string;
    period: string;
    highlights: string[];
  }[];
  relevantSkills?: {
    category: string;
    items: string[];
  }[];
};

export default function ReferMeClient() {
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"title" | "text" | "file">("title");
  const [customKit, setCustomKit] = useState<CustomKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pitch = customKit?.elevatorPitch ?? DEFAULT_PITCH;
  const strengths = customKit?.keyStrengths ?? DEFAULT_STRENGTHS;

  const currentCompany = experience.find((e) => e.current)?.company;

  const displayExperience = customKit?.relevantExperience
    ? customKit.relevantExperience
    : experience.slice(0, 3).map((e) => ({
        company: e.company,
        role: e.role,
        period: e.period,
        highlights: e.highlights.slice(0, 2),
      }));

  const displaySkills = customKit?.relevantSkills
    ? customKit.relevantSkills.map((rs) => ({
        category: rs.category,
        icon: skills.find((s) => s.category === rs.category)?.icon ?? "⚡",
        items: rs.items,
      }))
    : skills.slice(0, 4);

  const canCustomize = (inputMode === "title" && jobTitle.trim()) || (inputMode === "text" && jdText.trim()) || (inputMode === "file" && !!file);

  const customize = async () => {
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      if (inputMode === "title") formData.append("jobTitle", jobTitle);
      if (inputMode === "text") formData.append("jobDescription", jdText);
      if (inputMode === "file" && file) formData.append("file", file);
      const res = await fetch("/api/customize-referral", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCustomKit(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to customize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-5">
        {/* AI Customizer */}
        <div className="card bg-primary/5 border border-primary/20 shadow-sm">
          <div className="card-body p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-primary" />
              <h2 className="font-bold text-base-content text-sm">Customize for a Role</h2>
              <span className="badge badge-primary badge-soft badge-xs">AI</span>
            </div>
            <p className="text-base-content/50 text-xs mb-4 leading-relaxed">
              Tailor the pitch and strengths to a specific role - enter a job title, paste a JD, or upload a file.
            </p>

            <div role="tablist" className="tabs tabs-box tabs-sm w-fit mb-4">
              {([{ id: "title" as const, label: "Job Title" }, { id: "text" as const, label: "Paste JD" }, { id: "file" as const, label: "Upload" }]).map((m) => (
                <button key={m.id} role="tab" onClick={() => setInputMode(m.id)} className={`tab text-xs ${inputMode === m.id ? "tab-active" : ""}`}>{m.label}</button>
              ))}
            </div>

            {inputMode === "title" && (
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canCustomize && customize()}
                className="input input-bordered input-sm w-full" placeholder="e.g. Staff AI Engineer, ML Platform Lead..." />
            )}
            {inputMode === "text" && (
              <textarea rows={4} value={jdText} onChange={(e) => setJdText(e.target.value)}
                className="textarea textarea-bordered w-full text-sm" placeholder="Paste the job description here..." />
            )}
            {inputMode === "file" && (
              <div onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${file ? "border-primary/30 bg-primary/5" : "border-base-300 hover:border-primary/20"}`}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={16} className="text-primary" />
                    <span className="text-base-content text-sm font-medium">{file.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="btn btn-ghost btn-xs btn-circle"><X size={13} /></button>
                  </div>
                ) : (
                  <>
                    <Upload size={18} className="text-base-content/20 mx-auto mb-2" />
                    <p className="text-base-content/40 text-xs">Drop a JD file or click to browse (PDF, TXT, DOC)</p>
                  </>
                )}
              </div>
            )}

            {error && <div className="alert alert-error alert-soft text-xs mt-2">{error}</div>}

            {customKit && (
              <div className="mt-3 rounded-lg border border-success/25 bg-success/5 p-3">
                <div className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 shrink-0 text-success" />
                  <div className="min-w-0 space-y-2">
                    <p className="text-xs leading-snug">
                      <span className="text-base-content/50">Customized for </span>
                      <strong className="text-base-content">{customKit.inferredRole}</strong>
                    </p>
                    {customKit.suggestedSubject && (
                      <div className="rounded-md border border-base-300 bg-base-100/70 px-3 py-2">
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-base-content/40">
                          Suggested subject
                        </p>
                        <p className="text-xs leading-relaxed text-base-content/70 break-words">
                          {customKit.suggestedSubject}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3">
              <button onClick={customize} disabled={loading || !canCustomize} className="btn btn-primary btn-sm gap-2">
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {loading ? "Customizing..." : "Customize Referral Kit"}
              </button>
            </div>
          </div>
        </div>

        {/* Elevator Pitch */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base-content text-sm">Elevator Pitch</h2>
              <CopyButton text={pitch} />
            </div>
            <p className="text-base-content/60 text-sm leading-relaxed">{pitch}</p>
            {customKit?.whyNow && (
              <div className="mt-4 pt-4 border-t border-base-200">
                <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Why Now</p>
                <p className="text-base-content/60 text-xs leading-relaxed">{customKit.whyNow}</p>
              </div>
            )}
          </div>
        </div>

        {/* Key Strengths */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base-content text-sm flex items-center gap-2">
                <CheckCircle2 size={15} className="text-success" /> Key Strengths
              </h2>
              <CopyButton text={strengths.map((s) => `• ${s}`).join("\n")} />
            </div>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-base-content/60 text-sm leading-relaxed">
                  <span className="text-primary mt-0.5 flex-shrink-0">·</span>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                      strong: ({ children }) => <strong className="font-semibold text-base-content/80">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                  >
                    {s}
                  </ReactMarkdown>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Achievements from AI */}
        {customKit?.topAchievements && (
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <h2 className="font-bold text-base-content text-sm mb-4">Most Relevant Achievements</h2>
              <div className="space-y-3">
                {customKit.topAchievements.map((a, i) => (
                  <div key={i} className="bg-base-200/50 rounded-xl p-4">
                    <p className="text-base-content font-semibold text-sm mb-1">{a.achievement}</p>
                    <p className="text-base-content/50 text-xs">{a.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Experience */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <h2 className="font-bold text-base-content text-sm mb-4">
              Relevant Experience
              {customKit?.relevantExperience && (
                <span className="badge badge-primary badge-soft badge-xs ml-2">AI Tailored</span>
              )}
            </h2>
            <div className="space-y-5">
              {displayExperience.map((exp, i) => (
                <div key={i} className="border-l-2 border-base-300 pl-4">
                  {exp.company === currentCompany && (
                    <span className="badge badge-success badge-soft badge-xs mb-1">Current</span>
                  )}
                  <p className="font-semibold text-base-content text-sm">{exp.company}</p>
                  <p className="text-primary text-xs">{exp.role}</p>
                  <p className="text-base-content/40 text-xs mb-2">{exp.period}</p>
                  <ul className="space-y-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-base-content/60 text-xs">· {h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <h2 className="font-bold text-base-content text-sm mb-4">
              Skills Snapshot
              {customKit?.relevantSkills && (
                <span className="badge badge-primary badge-soft badge-xs ml-2">AI Tailored</span>
              )}
            </h2>
            <div className="space-y-3">
              {displaySkills.map((sg) => (
                <div key={sg.category} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0">{sg.icon}</span>
                  <div>
                    <p className="text-base-content/70 text-xs font-semibold mb-1">{sg.category}</p>
                    <p className="text-base-content/40 text-xs">{sg.items.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h2 className="font-bold text-base-content text-sm mb-3">Contact Sam</h2>
            <div className="space-y-2.5">
              <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm text-base-content/60 hover:text-base-content transition-colors">
                <Mail size={14} className="text-base-content/30" />{profile.email}
              </a>
              <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-base-content/60 hover:text-base-content transition-colors">
                <LinkedinIcon size={14} className="text-base-content/30" /> LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h2 className="font-bold text-base-content text-sm mb-3">Open To</h2>
            <ul className="space-y-2">
              {["Senior SWE / Staff Engineer", "AI Platform Engineer", "ML Infrastructure Engineer", "Backend Engineer (Python / Go)", "Research Engineer", "Technical Lead"].map((role) => (
                <li key={role} className="flex items-center gap-2 text-xs text-base-content/60">
                  <span className="size-1.5 rounded-full bg-primary flex-shrink-0" />{role}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h2 className="font-bold text-base-content text-sm mb-3">Education</h2>
            {education.map((e, i) => (
              <div key={i} className="mb-3">
                <p className="text-base-content font-semibold text-xs">{e.institution}</p>
                <p className="text-primary text-xs">{e.degree}</p>
                <p className="text-base-content/40 text-xs">{e.period}</p>
                {"achievement" in e && e.achievement && (
                  <span className="badge badge-warning badge-soft badge-xs mt-1">🏆 {e.achievement}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-5">
            <h2 className="font-bold text-base-content text-sm mb-3">Certifications</h2>
            <ul className="space-y-1.5">
              {certifications.slice(0, 4).map((cert, i) => (
                <li key={i} className="text-[11px] text-base-content/50">· {cert}</li>
              ))}
            </ul>
          </div>
        </div>

        <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full gap-2">
          <Download size={14} /> Download Full Resume
        </a>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { FileSearch, Download, Star, AlertCircle, CheckCircle2, Sparkles, Upload, FileText, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics/react";
import { profile } from "@/lib/data";

type Analysis = {
  fitScore: number;
  scoreReasoning: string;
  strengths: { skill: string; evidence: string; relevance: string }[];
  gaps: { requirement: string; assessment: string; mitigation: string }[];
  highlightedExperience: { company: string; achievement: string; relevance: string }[];
  tailoredResume: {
    summary: string;
    topSkills: string[];
    relevantExperience: { company: string; role: string; period: string; tailoredBullets: string[] }[];
    whyHire: string;
  };
  verdict: string;
};

function ScoreRing({ score }: { score: number }) {
  const pct = score / 100;
  const r = 50;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-error";
  const label = score >= 80 ? "Excellent Fit" : score >= 60 ? "Good Fit" : "Partial Fit";
  const stroke = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-28">
        <svg className="size-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" className="stroke-base-300" />
          <circle
            cx="60" cy="60" r={r} fill="none" strokeWidth="8"
            stroke={stroke} strokeLinecap="round"
            strokeDasharray={`${pct * circ} ${circ}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-base-content">{score}</span>
          <span className="text-[10px] text-base-content/40">/ 100</span>
        </div>
      </div>
      <span className={`badge badge-soft text-sm font-semibold ${color}`}>{label}</span>
    </div>
  );
}

export default function JDAnalyzerPage() {
  const router = useRouter();
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [processedJD, setProcessedJD] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAnalyze = inputMode === "text" ? jd.trim().length > 0 : file !== null;

  const analyze = async () => {
    if (!canAnalyze) return;
    setLoading(true); setError(""); setAnalysis(null);
    try {
      const formData = new FormData();
      if (inputMode === "file" && file) formData.append("file", file);
      else formData.append("jobDescription", jd);
      const res = await fetch("/api/analyze-jd", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
      setProcessedJD(data.processedJobDescription ?? jd);
      track("ai_jd_analyzer_used", { fitScore: data.fitScore });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReachOut = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      const res = await fetch("/api/jd-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: processedJD,
          inferredRole: analysis.tailoredResume.relevantExperience[0]?.role ?? "",
          fitScore: analysis.fitScore,
          verdict: analysis.verdict,
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/contact?jd_ref=${data.id}`);
        return;
      }
    } catch { /* fall through */ }
    finally { setSaving(false); }
    router.push("/contact");
  };

  const downloadResume = async () => {
    if (!analysis) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const PW = 210, PH = 297;
      const ML = 18, MR = 18, MT = 16, MB = 16;
      const CW = PW - ML - MR;
      let y = MT;

      // Primary brand colour (oklch 50% 0.22 293 ≈ slate-indigo)
      const C_PRIMARY:  [number,number,number] = [79, 43, 188];
      const C_DARK:     [number,number,number] = [15, 23, 42];
      const C_MID:      [number,number,number] = [71, 85, 105];
      const C_LIGHT:    [number,number,number] = [100, 116, 139];
      const C_SUBTLE:   [number,number,number] = [226, 232, 240];
      const C_BODY:     [number,number,number] = [51, 65, 85];

      const need = (h: number) => {
        if (y + h > PH - MB) { doc.addPage(); y = MT; }
      };

      // ── Section header with colour accent bar ────────
      const section = (title: string) => {
        need(14);
        doc.setFillColor(...C_PRIMARY);
        doc.rect(ML, y, 2, 5.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C_PRIMARY);
        doc.text(title, ML + 4, y + 4);
        y += 5.5;
        doc.setDrawColor(...C_SUBTLE);
        doc.setLineWidth(0.2);
        doc.line(ML + 4, y + 0.5, PW - MR, y + 0.5);
        y += 5;
      };

      // ── Wrapped body text ────────────────────────────
      const body = (
        text: string,
        opts: { indent?: number; size?: number; color?: [number,number,number]; leading?: number } = {}
      ) => {
        const { indent = 0, size = 9, color = C_BODY, leading = 5 } = opts;
        const lines = doc.splitTextToSize(text, CW - indent) as string[];
        need(lines.length * leading);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.text(lines, ML + indent, y);
        y += lines.length * leading;
      };

      // ══ HEADER ═══════════════════════════════════════
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(...C_DARK);
      doc.text("Samuel Abolo", ML, y);
      y += 2;
      // Thick primary rule under name
      doc.setDrawColor(...C_PRIMARY);
      doc.setLineWidth(1.8);
      doc.line(ML, y + 1, PW - MR, y + 1);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...C_MID);
      doc.text("Agentic AI Engineer  ·  Backend Systems  ·  LLM Infrastructure", ML, y);
      y += 5;

      // Contact — row 1
      doc.setFontSize(8.5);
      doc.setTextColor(...C_LIGHT);
      doc.text(`${profile.email}   |   ${profile.phone}`, ML, y);
      y += 4.5;
      // Contact — row 2
      doc.text("linkedin.com/in/samuel-abolo-24431a176   |   github.com/tecnosam", ML, y);
      y += 8;

      // ══ SUMMARY ══════════════════════════════════════
      section("PROFESSIONAL SUMMARY");
      body(analysis.tailoredResume.summary, { color: C_BODY });
      y += 4;

      // ══ KEY SKILLS ═══════════════════════════════════
      section("KEY SKILLS FOR THIS ROLE");
      // Skills as a wrapped comma-separated line with primary colour dots
      body(analysis.tailoredResume.topSkills.join("  ·  "), { color: C_BODY });
      y += 4;

      // ══ EXPERIENCE ═══════════════════════════════════
      section("RELEVANT EXPERIENCE");

      analysis.tailoredResume.relevantExperience.forEach((exp, i) => {
        need(20);

        // Company (bold, dark) + period (right, light)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...C_DARK);
        doc.text(exp.company, ML, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...C_LIGHT);
        doc.text(exp.period, PW - MR, y, { align: "right" });
        y += 5;

        // Role (italic, mid)
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(...C_MID);
        doc.text(exp.role, ML, y);
        y += 5.5;

        // Bullets with primary colour marker
        exp.tailoredBullets.forEach((bullet) => {
          const bLines = doc.splitTextToSize(bullet, CW - 6) as string[];
          need(bLines.length * 5);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...C_PRIMARY);
          doc.text(">", ML, y);
          doc.setTextColor(...C_BODY);
          doc.text(bLines, ML + 5, y);
          y += bLines.length * 5;
        });

        if (i < analysis.tailoredResume.relevantExperience.length - 1) y += 4;
      });

      y += 5;

      // ══ WHY HIRE ═════════════════════════════════════
      section("WHY HIRE SAMUEL FOR THIS ROLE");
      // Shaded callout box
      need(20);
      const whyLines = doc.splitTextToSize(analysis.tailoredResume.whyHire, CW - 8) as string[];
      const boxH = whyLines.length * 5 + 6;
      doc.setFillColor(243, 240, 255); // very light primary tint
      doc.roundedRect(ML, y, CW, boxH, 2, 2, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C_BODY);
      doc.text(whyLines, ML + 4, y + 4.5);
      y += boxH + 5;

      // ══ EDUCATION ════════════════════════════════════
      section("EDUCATION");
      need(16);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...C_DARK);
      doc.text("Babcock University", ML, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C_LIGHT);
      doc.text("2021 – 2024", PW - MR, y, { align: "right" });
      y += 5;
      doc.setFontSize(9);
      doc.setTextColor(...C_MID);
      doc.text("B.Sc. Software Engineering  ·  Valedictorian 2020", ML, y);
      y += 4.5;
      doc.setFontSize(8.5);
      doc.setTextColor(...C_LIGHT);
      doc.text("Thesis: ML-Based Predictive Model for Colorectal Cancer Patient Survival", ML, y);

      // ══ FOOTER (every page) ══════════════════════════
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalPages: number = (doc.internal as any).getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(...C_SUBTLE);
        doc.text(
          "AI-tailored resume · samuelabolo.dev · Full resume at /Samuel_Abolo_Resume.pdf",
          PW / 2, PH - 7, { align: "center" }
        );
      }

      doc.save("Samuel_Abolo_Tailored_Resume.pdf");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-5xl font-black text-base-content mb-3">JD Fit Analyzer</h1>
        <p className="text-base-content/50 text-base max-w-xl">
          Paste or upload any job description. Get a fit score, highlighted strengths, gap analysis, and a tailored resume - in seconds.
        </p>
      </div>

      {/* Input card */}
      <div className="card bg-base-100 border border-base-300 shadow-sm mb-8">
        <div className="card-body p-6">
          {/* Mode tabs */}
          <div role="tablist" className="tabs tabs-box tabs-sm w-fit mb-5">
            <button role="tab" onClick={() => setInputMode("text")} className={`tab gap-1.5 ${inputMode === "text" ? "tab-active" : ""}`}>
              <FileSearch size={13} /> Paste Text
            </button>
            <button role="tab" onClick={() => setInputMode("file")} className={`tab gap-1.5 ${inputMode === "file" ? "tab-active" : ""}`}>
              <Upload size={13} /> Upload File
            </button>
          </div>

          {inputMode === "text" ? (
            <div className="form-control">
              <textarea
                rows={9}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="textarea textarea-bordered w-full text-sm font-mono"
                placeholder="Paste the full job description here - the more detail, the better the analysis..."
              />
              <label className="label"><span className="label-text-alt text-base-content/30">{jd.length} characters</span></label>
            </div>
          ) : (
            <div
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                file ? "border-primary/30 bg-primary/5" : "border-base-300 hover:border-primary/30 hover:bg-base-200/50"
              }`}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={20} className="text-primary" />
                  <div className="text-left">
                    <p className="text-base-content font-medium text-sm">{file.name}</p>
                    <p className="text-base-content/40 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="btn btn-ghost btn-xs btn-circle">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-base-content/20 mx-auto mb-3" />
                  <p className="text-base-content/50 text-sm mb-1">Drop a file or click to browse</p>
                  <p className="text-base-content/30 text-xs">PDF, TXT, DOC, DOCX</p>
                </>
              )}
            </div>
          )}

          {error && <div className="alert alert-error alert-soft text-sm mt-2"><AlertCircle size={15} />{error}</div>}

          <div className="flex justify-end mt-2">
            <button onClick={analyze} disabled={loading || !canAnalyze} className="btn btn-primary gap-2">
              {loading ? <span className="loading loading-spinner loading-sm" /> : <FileSearch size={16} />}
              {loading ? "Analyzing..." : "Analyze Fit"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-5">
          {/* Score hero */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-8 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={analysis.fitScore} />
              <div className="flex-1 text-center md:text-left">
                <p className="text-base-content font-bold text-lg mb-2">{analysis.verdict}</p>
                <p className="text-base-content/60 text-sm leading-relaxed">{analysis.scoreReasoning}</p>
              </div>
            </div>
          </div>

          {/* Reach Out CTA — only for near-perfect fits */}
          {analysis.fitScore > 90 && (
            <div className="card bg-success text-success-content shadow-sm">
              <div className="card-body p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">This looks like a great match.</p>
                  <p className="text-success-content/75 text-sm leading-relaxed">
                    A {analysis.fitScore}/100 fit score is a strong signal. Samuel would love to hear about this role — reach out directly.
                  </p>
                </div>
                <button
                  onClick={handleReachOut}
                  disabled={saving}
                  className="btn bg-white text-success hover:bg-white/90 gap-2 flex-shrink-0"
                >
                  {saving ? <span className="loading loading-spinner loading-sm" /> : <ArrowRight size={15} />}
                  {saving ? "Preparing..." : "Reach Out"}
                </button>
              </div>
            </div>
          )}

          {/* Strengths */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <h2 className="card-title text-sm text-base-content mb-4 gap-2">
                <CheckCircle2 size={16} className="text-success" /> Strengths ({analysis.strengths.length})
              </h2>
              <div className="space-y-3">
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="bg-base-200/50 rounded-xl p-4">
                    <p className="font-semibold text-base-content text-sm mb-1">{s.skill}</p>
                    <p className="text-base-content/50 text-xs mb-1.5"><span className="font-medium">Evidence:</span> {s.evidence}</p>
                    <p className="text-primary text-xs"><span className="font-medium text-base-content/50">Relevance:</span> {s.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Highlighted Experience */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <h2 className="card-title text-sm text-base-content mb-4 gap-2">
                <Star size={16} className="text-warning" /> Most Relevant Experience
              </h2>
              <div className="space-y-3">
                {analysis.highlightedExperience.map((e, i) => (
                  <div key={i} className="border-l-2 border-primary pl-4">
                    <p className="text-primary text-xs font-semibold mb-0.5">{e.company}</p>
                    <p className="text-base-content text-sm font-medium mb-1">{e.achievement}</p>
                    <p className="text-base-content/50 text-xs">{e.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gaps */}
          {analysis.gaps.length > 0 && (
            <div className="card bg-warning/5 border border-warning/20 shadow-sm">
              <div className="card-body p-6">
                <h2 className="card-title text-sm text-base-content mb-4 gap-2">
                  <AlertCircle size={16} className="text-warning" /> Gaps & Mitigations ({analysis.gaps.length})
                </h2>
                <div className="space-y-3">
                  {analysis.gaps.map((g, i) => (
                    <div key={i} className="bg-base-100 rounded-xl p-4 border border-warning/10">
                      <p className="text-warning font-semibold text-sm mb-1">{g.requirement}</p>
                      <p className="text-base-content/60 text-xs mb-2">{g.assessment}</p>
                      <p className="text-success text-xs"><span className="font-medium text-base-content/50">Mitigation:</span> {g.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tailored Resume */}
          <div className="card bg-primary/5 border border-primary/15 shadow-sm">
            <div className="card-body p-6 space-y-5">
              <h2 className="card-title text-sm text-base-content gap-2">
                <FileSearch size={16} className="text-primary" /> Tailored Resume
              </h2>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-base-content/40 mb-2">Summary</p>
                <p className="text-base-content/60 text-sm leading-relaxed">{analysis.tailoredResume.summary}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-base-content/40 mb-2">Top Skills for This Role</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.tailoredResume.topSkills.map((skill) => (
                    <span key={skill} className="badge badge-primary badge-soft">{skill}</span>
                  ))}
                </div>
              </div>
              {analysis.tailoredResume.relevantExperience.map((exp, i) => (
                <div key={i} className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <p className="font-bold text-base-content text-sm">{exp.company}</p>
                    <p className="text-primary text-xs">{exp.role} · {exp.period}</p>
                    <ul className="mt-2 space-y-1.5">
                      {exp.tailoredBullets.map((b, j) => (
                        <li key={j} className="flex gap-2 text-base-content/60 text-sm">
                          <span className="text-primary flex-shrink-0">·</span>{b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              <div className="alert alert-info alert-soft text-sm">
                <strong>Why hire Sam:</strong> {analysis.tailoredResume.whyHire}
              </div>
              <button onClick={downloadResume} disabled={downloading} className="btn btn-outline btn-sm gap-2 w-fit">
                {downloading
                  ? <span className="loading loading-spinner loading-xs" />
                  : <Download size={14} />}
                {downloading ? "Generating PDF..." : "Download Tailored Resume"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

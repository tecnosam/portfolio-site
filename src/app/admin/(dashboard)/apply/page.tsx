"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Sparkles, Upload, FileText, X, ChevronDown, Download } from "lucide-react";
import { profile } from "@/lib/data";

type GuidanceItem = { question: string; bullets: string[] };
type TailoredResume = {
  summary: string;
  topSkills: string[];
  relevantExperience: { company: string; role: string; period: string; tailoredBullets: string[] }[];
  education: { institution: string; degree: string; period: string; note?: string }[];
};
type Result = { role: string; guidance: GuidanceItem[]; tailoredResume?: TailoredResume };

function QuestionRow({
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex gap-2 items-start">
      <span className="flex-shrink-0 size-6 rounded-full bg-base-300 text-base-content/50 text-xs font-bold flex items-center justify-center mt-2.5">
        {index + 1}
      </span>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`e.g. "Tell us about a time you led a technical project under pressure."`}
        className="textarea textarea-bordered flex-1 text-sm resize-none leading-relaxed"
      />
      {canRemove && (
        <button onClick={onRemove} className="btn btn-ghost btn-sm btn-square text-base-content/30 hover:text-error mt-1.5">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

function GuidanceCard({ item, index }: { item: GuidanceItem; index: number }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-base-200/50 transition-colors"
      >
        <span className="flex-shrink-0 size-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <p className="flex-1 text-sm font-semibold text-base-content leading-snug">{item.question}</p>
        <ChevronDown size={16} className={`flex-shrink-0 text-base-content/30 transition-transform mt-0.5 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          <ul className="space-y-2.5">
            {item.bullets.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-base-content/70 leading-relaxed">
                <span className="flex-shrink-0 size-1.5 rounded-full bg-primary mt-2" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ApplicationWizardPage() {
  const [jd, setJd] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdMode, setJdMode] = useState<"text" | "file">("text");
  const [questions, setQuestions] = useState<string[]>(["", ""]);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const canGenerate = jdMode === "text" ? jd.trim().length > 0 : jdFile !== null;

  const addQuestion = () => setQuestions((q) => [...q, ""]);
  const updateQuestion = (i: number, v: string) =>
    setQuestions((q) => q.map((x, idx) => (idx === i ? v : x)));
  const removeQuestion = (i: number) =>
    setQuestions((q) => q.filter((_, idx) => idx !== i));

  const generate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    let jobDescription = jd;

    if (jdMode === "file" && jdFile) {
      try {
        if (jdFile.type === "text/plain" || jdFile.name.endsWith(".txt")) {
          jobDescription = await jdFile.text();
        } else {
          // Send to the application-wizard API as multipart for server-side extraction
          const formData = new FormData();
          formData.append("file", jdFile);
          const extractRes = await fetch("/api/admin/application-wizard/extract", {
            method: "POST",
            body: formData,
          });
          if (extractRes.ok) {
            const { text } = await extractRes.json();
            jobDescription = text;
          }
        }
      } catch {
        // Fall through with empty jd — will be caught by canGenerate
      }
    }

    try {
      const res = await fetch("/api/admin/application-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          questions: questions.filter((q) => q.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async () => {
    if (!result?.tailoredResume) return;
    const tr = result.tailoredResume;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const PW = 210, PH = 297, ML = 13, MR = 13, MT = 13, MB = 13, CW = PW - ML - MR;
      let y = MT;
      const INK:   [number,number,number] = [26,26,26];
      const BODY:  [number,number,number] = [45,45,45];
      const MID:   [number,number,number] = [90,90,90];
      const LIGHT: [number,number,number] = [140,140,140];
      const RULE:  [number,number,number] = [200,200,200];
      const L = 4.2;

      const wrap = (text: string, indent = 0, size = 10, color = BODY) => {
        const lines = doc.splitTextToSize(text, CW - indent) as string[];
        doc.setFontSize(size); doc.setTextColor(...color);
        doc.text(lines, ML + indent, y); y += lines.length * L;
      };
      const section = (title: string) => {
        y += 3.5;
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...INK);
        doc.text(title, ML, y); y += 1.5;
        doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
        doc.line(ML, y, PW - MR, y); y += 3.5;
      };

      // Header
      doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(...INK);
      doc.text("Samuel Abolo", ML, y); y += 5.5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...MID);
      doc.text(`${result.role}  |  Backend Systems  |  LLM Infrastructure`, ML, y); y += 4.5;
      doc.setFontSize(9); doc.setTextColor(...MID);
      const cLines = doc.splitTextToSize([profile.email, profile.phone, "linkedin.com/in/samuel-abolo-24431a176", "github.com/tecnosam"].join("  |  "), CW) as string[];
      doc.text(cLines, ML, y); y += cLines.length * 4 + 1;
      doc.setDrawColor(...RULE); doc.setLineWidth(0.4); doc.line(ML, y, PW - MR, y);

      section("SUMMARY");
      doc.setFont("helvetica", "normal"); wrap(tr.summary, 0, 10, BODY);

      section("EXPERIENCE");
      tr.relevantExperience.forEach((exp, i) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...INK);
        doc.text(exp.company, ML, y);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...LIGHT);
        doc.text(exp.period, PW - MR, y, { align: "right" }); y += L;
        doc.setFont("helvetica", "italic"); doc.setFontSize(10); doc.setTextColor(...MID);
        doc.text(exp.role, ML, y); y += L + 0.5;
        doc.setFont("helvetica", "normal");
        exp.tailoredBullets.forEach((b) => {
          const bl = doc.splitTextToSize(b, CW - 4.5) as string[];
          doc.setFontSize(10); doc.setTextColor(...BODY);
          doc.text("-", ML, y); doc.text(bl, ML + 4.5, y); y += bl.length * L;
        });
        if (i < tr.relevantExperience.length - 1) y += 2.5;
      });

      section("SKILLS");
      doc.setFont("helvetica", "normal"); wrap(tr.topSkills.join("  |  "), 0, 10, BODY);

      section("EDUCATION");
      (tr.education ?? []).forEach((edu, i, arr) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...INK);
        doc.text(edu.institution, ML, y);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...LIGHT);
        doc.text(edu.period, PW - MR, y, { align: "right" }); y += L;
        doc.setFontSize(10); doc.setTextColor(...BODY); doc.text(edu.degree, ML, y); y += L;
        if (edu.note) {
          const nl = doc.splitTextToSize(edu.note, CW) as string[];
          doc.setFontSize(9.5); doc.setTextColor(...MID); doc.text(nl, ML, y); y += nl.length * L;
        }
        if (i < arr.length - 1) y += 1.5;
      });

      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...RULE);
      doc.text("samuelabolo.dev", PW / 2, PH - 6, { align: "center" });
      doc.save(`Samuel_Abolo_${result.role.replace(/\s+/g, "_")}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-base-content">Application Wizard</h1>
        <p className="text-base-content/50 text-sm mt-1">
          Paste the job description and add the application questions. Get strategic bullet points on how to answer each one.
        </p>
      </div>

      <div className="space-y-6">
        {/* JD Section */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base-content text-sm">Job Description</h2>
              <div role="tablist" className="tabs tabs-box tabs-xs">
                <button role="tab" onClick={() => setJdMode("text")} className={`tab ${jdMode === "text" ? "tab-active" : ""}`}>Paste</button>
                <button role="tab" onClick={() => setJdMode("file")} className={`tab ${jdMode === "file" ? "tab-active" : ""}`}>Upload</button>
              </div>
            </div>

            {jdMode === "text" ? (
              <textarea
                rows={8}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here…"
                className="textarea textarea-bordered w-full text-sm font-mono leading-relaxed"
              />
            ) : (
              <div
                onClick={() => !jdFile && fileRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setJdFile(f); }}
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  jdFile ? "border-primary/30 bg-primary/5" : "border-base-300 hover:border-primary/30"
                }`}
              >
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setJdFile(f); }} />
                {jdFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={18} className="text-primary" />
                    <span className="text-base-content text-sm font-medium">{jdFile.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setJdFile(null); }} className="btn btn-ghost btn-xs btn-circle">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="text-base-content/20 mx-auto mb-2" />
                    <p className="text-base-content/40 text-sm">Drop a file or click to browse</p>
                    <p className="text-base-content/25 text-xs mt-1">PDF, TXT, DOC, DOCX</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Questions Section */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6">
            <h2 className="font-bold text-base-content text-sm mb-4">Application Questions</h2>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <QuestionRow
                  key={i}
                  index={i}
                  value={q}
                  onChange={(v) => updateQuestion(i, v)}
                  onRemove={() => removeQuestion(i)}
                  canRemove={questions.length > 1}
                />
              ))}
            </div>
            <button onClick={addQuestion} className="btn btn-ghost btn-sm gap-2 text-base-content/50 mt-3">
              <Plus size={13} /> Add question
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error alert-soft text-sm">{error}</div>
        )}

        <button
          onClick={generate}
          disabled={loading || !canGenerate}
          className="btn btn-primary gap-2 w-full"
        >
          {loading ? <span className="loading loading-spinner loading-sm" /> : <Sparkles size={15} />}
          {loading ? "Generating guidance…" : "Generate Guidance"}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-base-300" />
              <span className="text-xs text-base-content/40 font-medium">{result.role}</span>
              <div className="h-px flex-1 bg-base-300" />
            </div>

            {/* Guidance cards */}
            {result.guidance.map((item, i) => (
              <GuidanceCard key={i} item={item} index={i} />
            ))}

            {/* Tailored resume preview + download */}
            {result.tailoredResume && (
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-base-content text-sm">Tailored Resume</h2>
                    <button
                      onClick={downloadResume}
                      disabled={downloading}
                      className="btn btn-primary btn-sm gap-2"
                    >
                      {downloading
                        ? <span className="loading loading-spinner loading-xs" />
                        : <Download size={13} />}
                      {downloading ? "Generating…" : "Download PDF"}
                    </button>
                  </div>

                  {/* Summary */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-base-content/35 mb-1.5">Summary</p>
                    <p className="text-sm text-base-content/70 leading-relaxed">{result.tailoredResume.summary}</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-base-content/35 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.tailoredResume.topSkills.map((s) => (
                        <span key={s} className="badge badge-ghost border border-base-300 badge-sm">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-base-content/35 mb-3">Experience</p>
                    <div className="space-y-4">
                      {result.tailoredResume.relevantExperience.map((exp, i) => (
                        <div key={i} className="border-l-2 border-base-300 pl-4">
                          <div className="flex items-baseline justify-between gap-2 mb-0.5">
                            <p className="font-semibold text-base-content text-sm">{exp.company}</p>
                            <p className="text-base-content/35 text-xs flex-shrink-0">{exp.period}</p>
                          </div>
                          <p className="text-primary text-xs mb-2">{exp.role}</p>
                          <ul className="space-y-1">
                            {exp.tailoredBullets.map((b, j) => (
                              <li key={j} className="flex gap-2 text-base-content/60 text-xs leading-relaxed">
                                <span className="flex-shrink-0">-</span>{b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  {result.tailoredResume.education?.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-base-content/35 mb-2">Education</p>
                      <div className="space-y-2">
                        {result.tailoredResume.education.map((edu, i) => (
                          <div key={i} className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-base-content">{edu.institution}</p>
                              <p className="text-xs text-base-content/50">{edu.degree}{edu.note ? `  ·  ${edu.note}` : ""}</p>
                            </div>
                            <p className="text-xs text-base-content/35 flex-shrink-0">{edu.period}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

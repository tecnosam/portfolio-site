"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Sparkles, ArrowRight, Lightbulb, Target, Wrench, AlertCircle } from "lucide-react";

type Analysis = {
  headline: string;
  summary: string;
  immediateWins: { area: string; problem: string; solution: string; impact: string; timeframe: string }[];
  strategicValue: { initiative: string; description: string; whySam: string; outcome: string }[];
  techRecommendations: { current: string; recommended: string; reasoning: string }[];
  engagementModels: { type: string; description: string; bestFor: string }[];
  callToAction: string;
};

const examples = [
  "We're a Series A fintech with 50k users. Python/Django backend, PostgreSQL. Struggling with slow ML inference (30 seconds per request) and blocked data pipelines. 3 backend engineers.",
  "B2B SaaS, enterprise HR software, 200 enterprise clients. Node.js, React, AWS RDS. We want to add AI features - document processing and an HR chatbot - but don't know where to start.",
  "E-commerce platform, 2M monthly active users. Redis caching, MySQL. We want to modernize our rule-based recommendation engine with ML.",
];

export default function HowCanIHelpPage() {
  const router = useRouter();
  const [businessInfo, setBusinessInfo] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!businessInfo.trim()) return;
    setLoading(true); setError(""); setAnalysis(null);
    try {
      const res = await fetch("/api/how-can-i-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLetsTalk = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      const res = await fetch("/api/how-can-i-help/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo, analysis }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/contact?ref=${data.id}`);
        return;
      }
    } catch {
      // fall through to plain contact on save failure
    } finally {
      setSaving(false);
    }
    router.push("/contact");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-5xl font-black text-base-content mb-3">How Can I Help?</h1>
        <p className="text-base-content/50 text-base max-w-xl">
          Tell me about your business, team, tech stack, and challenges. Get a specific, honest analysis of how Samuel Abolo can add value.
        </p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm mb-8">
        <div className="card-body p-6">
          <div className="form-control mb-4">
            <label className="label"><span className="label-text text-xs font-medium">About Your Business</span></label>
            <textarea
              rows={7}
              value={businessInfo}
              onChange={(e) => setBusinessInfo(e.target.value)}
              className="textarea textarea-bordered w-full text-sm"
              placeholder="Describe your company, team size, tech stack, current challenges, and what you're trying to build or improve..."
            />
          </div>

          {/* Examples */}
          <div className="space-y-2 mb-4">
            <p className="text-[10px] uppercase tracking-widest text-base-content/30">Quick examples</p>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setBusinessInfo(ex)}
                className="block w-full text-left text-xs text-base-content/50 hover:text-base-content p-3 rounded-lg border border-base-300 hover:border-primary/20 hover:bg-base-200/50 transition-all leading-relaxed"
              >
                {ex.slice(0, 110)}…
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error alert-soft text-sm mb-3"><AlertCircle size={15} />{error}</div>}

          <div className="flex justify-end">
            <button onClick={analyze} disabled={loading || !businessInfo.trim()} className="btn btn-success gap-2">
              {loading ? <span className="loading loading-spinner loading-sm" /> : <HelpCircle size={16} />}
              {loading ? "Analyzing..." : "Generate Analysis"}
            </button>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="space-y-5">
          {/* Headline */}
          <div className="card bg-success/5 border border-success/20 shadow-sm">
            <div className="card-body p-8">
              <h2 className="text-3xl font-bold text-base-content mb-3">{analysis.headline}</h2>
              <p className="text-base-content/60 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>

          {/* Immediate Wins */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <h2 className="card-title text-sm gap-2 mb-5">
                <Sparkles size={16} className="text-warning" /> Immediate Wins
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.immediateWins.map((win, i) => (
                  <div key={i} className="bg-base-200/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge badge-warning badge-soft badge-sm">{win.area}</span>
                      <span className="text-[10px] text-base-content/40">{win.timeframe}</span>
                    </div>
                    <p className="text-base-content/50 text-xs mb-2"><span className="font-medium text-base-content/70">Problem:</span> {win.problem}</p>
                    <p className="text-base-content font-semibold text-sm mb-2">{win.solution}</p>
                    <p className="text-success text-xs"><span className="text-base-content/40">Impact:</span> {win.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Value */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <h2 className="card-title text-sm gap-2 mb-4">
                <Target size={16} className="text-primary" /> Strategic Initiatives
              </h2>
              <div className="space-y-4">
                {analysis.strategicValue.map((item, i) => (
                  <div key={i} className="border-l-2 border-primary/30 pl-4">
                    <p className="text-base-content font-semibold text-sm mb-1">{item.initiative}</p>
                    <p className="text-base-content/60 text-xs mb-1.5">{item.description}</p>
                    <p className="text-primary text-xs"><span className="text-base-content/40">Why Sam:</span> {item.whySam}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Recommendations */}
          {analysis.techRecommendations.length > 0 && (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-6">
                <h2 className="card-title text-sm gap-2 mb-4">
                  <Wrench size={16} className="text-info" /> Tech Recommendations
                </h2>
                <div className="space-y-4">
                  {analysis.techRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_1fr] gap-3 items-start"
                    >
                      <p className="min-w-0 rounded-lg bg-base-200/60 p-3 text-xs leading-relaxed text-base-content/40 line-through">
                        {rec.current}
                      </p>
                      <ArrowRight
                        size={14}
                        className="mx-auto hidden text-base-content/30 lg:block lg:mt-3"
                      />
                      <p className="min-w-0 rounded-lg bg-primary/10 p-3 text-xs leading-relaxed font-medium text-primary">
                        {rec.recommended}
                      </p>
                      <p className="min-w-0 rounded-lg bg-base-200/60 p-3 text-xs leading-relaxed text-base-content/50">
                        {rec.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Engagement Models */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-6">
              <h2 className="card-title text-sm gap-2 mb-4">
                <Lightbulb size={16} className="text-success" /> How We Could Work Together
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.engagementModels.map((model, i) => (
                  <div key={i} className="bg-base-200/40 rounded-xl p-4">
                    <span className="badge badge-success badge-soft badge-sm mb-2">{model.type}</span>
                    <p className="text-base-content/60 text-xs mb-2 leading-relaxed">{model.description}</p>
                    <p className="text-base-content/40 text-[10px]"><span className="font-medium">Best for:</span> {model.bestFor}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="card bg-primary text-primary-content shadow-sm">
            <div className="card-body p-8 text-center gap-4">
              <p className="font-bold text-lg">{analysis.callToAction}</p>
              <div>
                <button
                  onClick={handleLetsTalk}
                  disabled={saving}
                  className="btn bg-white text-primary hover:bg-white/90 gap-2"
                >
                  {saving ? <span className="loading loading-spinner loading-sm" /> : <ArrowRight size={15} />}
                  {saving ? "Saving..." : "Let's Talk"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

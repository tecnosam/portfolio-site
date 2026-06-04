"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EnrichedMessage } from "./page";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = diff / 1000 / 60 / 60;
  if (hours < 24) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (hours < 24 * 7) return d.toLocaleDateString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function stripRefFooter(msg: string) {
  const idx = msg.search(/\n*—\s*(JD Reference|AI Analysis Ref):/i);
  return (idx >= 0 ? msg.slice(0, idx) : msg).trim();
}

function ScorePill({ score }: { score: number }) {
  const color = score >= 90 ? "bg-success/15 text-success" : score >= 70 ? "bg-warning/15 text-warning" : "bg-base-300 text-base-content/50";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${color}`}>{score}/100</span>;
}

function Row({ msg, onMarkRead }: { msg: EnrichedMessage; onMarkRead: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(() => onMarkRead(msg.id));
  };

  const cleanMessage = stripRefFooter(msg.message);

  return (
    <div className={`border-b border-base-300 last:border-0 ${!msg.read ? "bg-primary/2" : ""}`}>
      {/* Row header */}
      <div
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-base-200/60 select-none`}
      >
        {/* Unread dot */}
        <div className="flex-shrink-0 w-2">
          {!msg.read && <div className="size-2 rounded-full bg-primary" />}
        </div>

        {/* Name + email */}
        <div className="min-w-0 w-44 flex-shrink-0">
          <p className={`text-sm truncate ${msg.read ? "text-base-content/60 font-normal" : "text-base-content font-semibold"}`}>
            {msg.name}
          </p>
          <p className="text-xs text-base-content/40 truncate font-mono">{msg.email}</p>
        </div>

        {/* Subject */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${msg.read ? "text-base-content/50" : "text-base-content/80"}`}>
            {msg.subject}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {msg.jdSubmission && (
            <ScorePill score={msg.jdSubmission.fit_score} />
          )}
          {msg.jdSubmission && (
            <span className="badge badge-xs badge-outline text-base-content/40">JD</span>
          )}
          {msg.helpInquiry && (
            <span className="badge badge-xs badge-outline text-base-content/40">Inquiry</span>
          )}
        </div>

        {/* Date */}
        <p className="text-xs text-base-content/35 font-mono flex-shrink-0 w-20 text-right">{formatDate(msg.created_at)}</p>

        {/* Chevron */}
        <svg className={`size-4 text-base-content/25 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded content */}
      {open && (
        <div className="px-11 pb-6 pt-1 space-y-5">
          {/* Message */}
          <div className="bg-base-200/60 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-base-content/35 mb-3">Message</p>
            <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-wrap">{cleanMessage}</p>
          </div>

          {/* JD Submission */}
          {msg.jdSubmission && (
            <div className="border border-base-300 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-base-content/35">Job Description</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-base-content/50">{msg.jdSubmission.inferred_role}</span>
                  <ScorePill score={msg.jdSubmission.fit_score} />
                </div>
              </div>
              {msg.jdSubmission.verdict && (
                <p className="text-sm font-medium text-base-content/70 italic">"{msg.jdSubmission.verdict}"</p>
              )}
              {msg.jdSubmission.job_description && (
                <details className="group">
                  <summary className="text-xs text-primary cursor-pointer hover:text-primary/80 list-none flex items-center gap-1">
                    <svg className="size-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    View full job description
                  </summary>
                  <div className="mt-3 bg-base-200/60 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <p className="text-xs text-base-content/60 leading-relaxed whitespace-pre-wrap font-mono">{msg.jdSubmission.job_description}</p>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Help Inquiry */}
          {msg.helpInquiry && (
            <div className="border border-base-300 rounded-xl p-5 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-base-content/35">How Can I Help — Inquiry</p>
              {msg.helpInquiry.analysis?.headline && (
                <p className="text-sm font-semibold text-base-content/80">{msg.helpInquiry.analysis.headline}</p>
              )}
              {msg.helpInquiry.analysis?.summary && (
                <p className="text-sm text-base-content/60 leading-relaxed">{msg.helpInquiry.analysis.summary}</p>
              )}
              <details className="group">
                <summary className="text-xs text-primary cursor-pointer hover:text-primary/80 list-none flex items-center gap-1">
                  <svg className="size-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  View business context
                </summary>
                <div className="mt-3 bg-base-200/60 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-xs text-base-content/60 leading-relaxed whitespace-pre-wrap">{msg.helpInquiry.business_info}</p>
                </div>
              </details>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!msg.read && (
              <button
                onClick={handleMarkRead}
                disabled={pending}
                className="btn btn-xs btn-ghost text-base-content/50"
              >
                {pending ? <span className="loading loading-spinner loading-xs" /> : "Mark as read"}
              </button>
            )}
            <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`} className="btn btn-xs btn-primary">
              Reply
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubmissionsClient({ messages }: { messages: EnrichedMessage[] }) {
  const [items, setItems] = useState(messages);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  const markRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from("contact_messages").update({ read: true }).eq("id", id);
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const visible = filter === "unread" ? items.filter((m) => !m.read) : items;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4">
        {(["unread", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-base-content text-base-100" : "text-base-content/50 hover:text-base-content hover:bg-base-200"
            }`}
          >
            {f === "unread" ? `Unread (${items.filter((m) => !m.read).length})` : `All (${items.length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center py-16 text-base-content/30 text-sm">
            {filter === "unread" ? "All caught up." : "No submissions yet."}
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
          {visible.map((msg) => (
            <Row key={msg.id} msg={msg} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}

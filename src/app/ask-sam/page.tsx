"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, Bot, ArrowRight, FileSearch, Lightbulb, Users, HeartCrack } from "lucide-react";
import { track } from "@vercel/analytics/react";
import ReactMarkdown from "react-markdown";
import type { Recommendation } from "@/app/api/ask-sam/route";

type Message = {
  role: "user" | "assistant";
  content: string;
  recommendations?: Recommendation[];
};

const FEATURE_META: Record<
  Recommendation["feature"],
  { label: string; href: string; icon: React.ElementType }
> = {
  "jd-analyzer":    { label: "JD Fit Analyzer",  href: "/jd-analyzer",    icon: FileSearch },
  "how-can-i-help": { label: "How Can I Help?",   href: "/how-can-i-help", icon: Lightbulb  },
  "refer-me":       { label: "Refer Me",          href: "/refer-me",       icon: Users      },
};

const RATE_LIMITED_SENTINEL = "__RATE_LIMITED__";

function RateLimitedBubble() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <HeartCrack size={15} className="text-error flex-shrink-0" />
        <p className="font-semibold text-base-content text-sm">Rate limit reached</p>
      </div>
      <p className="text-base-content/50 text-xs italic leading-relaxed">
        &ldquo;People are too in-love with my AI, but sadly it&apos;s not free...&rdquo;
      </p>
      <p className="text-base-content/60 text-xs leading-relaxed">
        The AI is taking a breather. Samuel, however, is very much available.
      </p>
      <a href="/contact" className="btn btn-primary btn-xs gap-1.5 w-full justify-center">
        Reach Samuel directly <ArrowRight size={11} />
      </a>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="chat-image">
      <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-content" aria-hidden>
        <Bot size={16} />
      </div>
    </div>
  );
}

function RecommendationChips({ recs }: { recs: Recommendation[] }) {
  if (!recs.length) return null;
  return (
    <div className="mt-3 pt-3 border-t border-base-300/60 space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-base-content/30">Might be useful</p>
      <div className="flex flex-wrap gap-2">
        {recs.map((r) => {
          const meta = FEATURE_META[r.feature];
          const Icon = meta.icon;
          return (
            <a
              key={r.feature}
              href={meta.href}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              title={r.reason}
            >
              <Icon size={11} />
              {meta.label}
              <ArrowRight size={10} className="opacity-60" />
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ContactCTA({ messages }: { messages: Message[] }) {
  const [summarizing, setSummarizing] = useState(false);

  const handleClick = async () => {
    setSummarizing(true);
    let message = "";
    try {
      const res = await fetch("/api/ask-sam/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .filter((m) => m.role === "user" && m.content !== RATE_LIMITED_SENTINEL)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      message = data.summary ?? "";
    } catch {
      // fall through with empty message
    } finally {
      setSummarizing(false);
    }
    const url =
      `/contact?subject=${encodeURIComponent("Following up on our chat")}` +
      (message ? `&message=${encodeURIComponent(message)}` : "");
    window.location.href = url;
  };

  return (
    <div className="mx-5 mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot size={15} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-base-content mb-0.5">Want to talk directly with Samuel?</p>
        <p className="text-xs text-base-content/50 mb-3 leading-relaxed">
          He&apos;d love to hear from you. An AI summary of your conversation will be prefilled so he has full context.
        </p>
        <button onClick={handleClick} disabled={summarizing} className="btn btn-primary btn-xs gap-1.5">
          {summarizing ? <span className="loading loading-spinner loading-xs" /> : <ArrowRight size={12} />}
          {summarizing ? "Preparing summary..." : "Continue the conversation"}
        </button>
      </div>
    </div>
  );
}

const starters = [
  "What's Sam's experience with production RAG?",
  "Tell me about the TripAdvisor achievement",
  "What technologies does Sam know best?",
  "What kind of roles is Sam looking for?",
  "What are Sam's hobbies?",
  "Tell me about Sam's multi-agent work",
];

const CTA_QUESTION_THRESHOLD = 5;
const USER_DAILY_LIMIT = 10;
const STORAGE_KEY = "ask-sam-usage";

function getLocalUsage(): { count: number; date: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { count: 0, date: "" };
}

function incrementLocalUsage(): number {
  const today = new Date().toISOString().slice(0, 10);
  const prev = getLocalUsage();
  const count = prev.date === today ? prev.count + 1 : 1;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, date: today }));
  } catch { /* ignore */ }
  return count;
}

function isLocalLimitReached(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const { count, date } = getLocalUsage();
  return date === today && count >= USER_DAILY_LIMIT;
}

export default function AskSamPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm Sam's AI assistant. I know his full background — skills, experience, projects, and what he's looking for next. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading || rateLimited) return;

    // Browser-side per-user daily limit (no API call, no PII stored)
    if (isLocalLimitReached()) {
      setRateLimited(true);
      setMessages((prev) => [...prev, { role: "user", content: message }, { role: "assistant", content: RATE_LIMITED_SENTINEL }]);
      setInput("");
      return;
    }

    const newMessages: Message[] = [...messages, { role: "user", content: message }];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    incrementLocalUsage();
    track("ai_ask_sam_message_sent");

    try {
      const res = await fetch("/api/ask-sam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages.slice(1).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (data.rateLimited) {
        setRateLimited(true);
        setMessages([...newMessages, { role: "assistant", content: RATE_LIMITED_SENTINEL }]);
        return;
      }

      const responseText: string = data.response || data.error || "Sorry, something went wrong.";
      const uncertain: boolean = data.uncertain ?? false;
      const recommendations: Recommendation[] = data.recommendations ?? [];

      const nextMessages: Message[] = [
        ...newMessages,
        { role: "assistant", content: responseText, recommendations },
      ];
      setMessages(nextMessages);

      // Show CTA if uncertain OR after threshold questions
      const nextUserCount = nextMessages.filter((m) => m.role === "user").length;
      if (uncertain || nextUserCount >= CTA_QUESTION_THRESHOLD) {
        setShowCTA(true);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => {
    setMessages([messages[0]]);
    setInput("");
    setShowCTA(false);
    setRateLimited(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <div className="py-4 sm:py-8 flex-shrink-0">
        <h1 className="text-3xl sm:text-5xl font-black text-base-content mb-2">Ask About Sam</h1>
        <p className="text-base-content/50 text-sm">
          Chat with an AI that knows Samuel&apos;s full background. Ask about skills, experience, projects, or anything else.
        </p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm flex-1 flex flex-col min-h-0 mb-1">
        {/* Messages */}
        <div ref={messagesRef} className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
              {msg.role === "assistant" && <AssistantAvatar />}
              <div className={`chat-bubble text-sm leading-relaxed ${
                msg.role === "user" ? "chat-bubble-primary" : "bg-base-200 text-base-content"
              }`}>
                {msg.role === "assistant" ? (
                  msg.content === RATE_LIMITED_SENTINEL ? (
                    <RateLimitedBubble />
                  ) : (
                    <>
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <RecommendationChips recs={msg.recommendations} />
                      )}
                    </>
                  )
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat chat-start">
              <AssistantAvatar />
              <div className="chat-bubble bg-base-200">
                <span className="loading loading-dots loading-sm" />
              </div>
            </div>
          )}

        </div>

        {/* CTA — shown after 5 questions or when AI is uncertain */}
        {showCTA && !loading && <ContactCTA messages={messages} />}

        {/* Starter chips */}
        {messages.length === 1 && (
          <div className="px-5 pb-3">
            <p className="text-[10px] uppercase tracking-widest text-base-content/30 mb-2">Suggested</p>
            <div className="flex flex-wrap gap-2">
              {starters.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="badge badge-ghost badge-lg border border-base-300 hover:border-primary/30 hover:bg-primary/5 text-xs cursor-pointer transition-colors text-base-content/60 hover:text-base-content"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        {rateLimited ? (
          <div className="border-t border-base-200 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-base-content/40 flex items-center gap-1.5">
              <HeartCrack size={12} className="text-error" />
              AI unavailable ·{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact Samuel directly
              </a>
            </p>
            <button onClick={reset} className="btn btn-ghost btn-xs gap-1 text-base-content/40">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        ) : (
          <div className="border-t border-base-200 p-4 flex items-end gap-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              className="textarea textarea-ghost flex-1 text-sm resize-none leading-relaxed min-h-0 focus:outline-none"
              placeholder="Ask anything about Sam..."
              style={{ minHeight: "24px" }}
            />
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={reset}
                className="btn btn-ghost btn-sm btn-square text-base-content/30"
                title="Reset chat"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="btn btn-primary btn-sm btn-square"
              >
                {loading ? <span className="loading loading-spinner loading-xs" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* Question counter — subtle hint */}
        {userCount > 0 && userCount < CTA_QUESTION_THRESHOLD && (
          <p className="text-center text-[10px] text-base-content/20 pb-2">
            {CTA_QUESTION_THRESHOLD - userCount} question{CTA_QUESTION_THRESHOLD - userCount !== 1 ? "s" : ""} until a direct contact option appears
          </p>
        )}
      </div>

      <p className="text-center text-xs text-base-content/30 py-2 flex-shrink-0">
        Responses are AI-generated based on Samuel&apos;s real background · Press Enter to send
      </p>
    </div>
  );
}

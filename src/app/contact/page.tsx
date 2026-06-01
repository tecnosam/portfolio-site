"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, MapPin, Send, CheckCircle } from "lucide-react";
import { profile } from "@/lib/data";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/ui/SocialIcons";

const contacts = [
  { icon: <Mail size={16} />, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { icon: <LinkedinIcon size={16} />, label: "LinkedIn", value: "samuel-abolo-24431a176", href: profile.socials.linkedin },
  { icon: <GithubIcon size={16} />, label: "GitHub", value: "tecnosam", href: profile.socials.github },
  { icon: <TwitterIcon size={16} />, label: "Twitter", value: "@samuel_abolo", href: profile.socials.twitter },
];

function ContactForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [inquiryRef, setInquiryRef] = useState<string | null>(null);

  useEffect(() => {
    const subject = searchParams.get("subject") ?? "";
    const message = searchParams.get("message") ?? "";
    const ref = searchParams.get("ref") ?? "";

    if (subject || message) {
      setForm((f) => ({ ...f, subject, message }));
    }

    if (ref) {
      setInquiryRef(ref);
      fetch(`/api/how-can-i-help/inquiry/${ref}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.businessInfo) {
            setForm((f) => ({
              ...f,
              subject: f.subject || (data.headline ? `Following up: ${data.headline}` : "Following up on my AI analysis"),
              message: f.message || data.businessInfo,
            }));
          }
        })
        .catch(() => {/* ignore — form stays empty */});
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const payload = {
      ...form,
      message: inquiryRef
        ? `${form.message}\n\n— AI Analysis Ref: ${inquiryRef}`
        : form.message,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="card bg-success/5 border border-success/20 h-full">
        <div className="card-body items-center justify-center text-center gap-4">
          <CheckCircle size={40} className="text-success" />
          <div>
            <h3 className="font-bold text-base-content text-lg mb-1">Message sent!</h3>
            <p className="text-base-content/50 text-sm">I&apos;ll get back to you within 24–48 hours.</p>
          </div>
          <button onClick={() => setStatus("idle")} className="btn btn-outline btn-sm mt-2">
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Name</span></label>
              <input
                type="text" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input input-bordered input-sm w-full"
                placeholder="Your name"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-xs font-medium">Email</span></label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input input-bordered input-sm w-full"
                placeholder="you@company.com"
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-xs font-medium">Subject</span></label>
            <input
              type="text" required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="input input-bordered input-sm w-full"
              placeholder="What's this about?"
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-xs font-medium">Message</span></label>
            <textarea
              required rows={7}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="textarea textarea-bordered w-full text-sm"
              placeholder="Tell me what you have in mind..."
            />
          </div>
          {inquiryRef && (
            <div className="alert alert-info alert-soft text-xs gap-2">
              <span className="font-medium">Context saved.</span> Sam will have your full AI analysis when reviewing this message.
            </div>
          )}
          {status === "error" && (
            <div className="alert alert-error alert-soft text-xs">
              Something went wrong. Email me directly at {profile.email}
            </div>
          )}
          <button type="submit" disabled={status === "loading"} className="btn btn-primary w-full gap-2">
            {status === "loading" ? <span className="loading loading-spinner loading-sm" /> : <Send size={15} />}
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Say Hello</p>
        <h1 className="text-5xl font-black text-base-content mb-3">Contact</h1>
        <p className="text-base-content/50 max-w-xl text-base leading-relaxed">
          Whether you want to collaborate, have a role in mind, or just want to talk shop about AI systems - my inbox is open.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Info column */}
        <div className="lg:col-span-2 space-y-4">
          {contacts.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card bg-base-100 border border-base-300 shadow-sm card-lift block"
            >
              <div className="card-body p-4 flex-row items-center gap-4">
                <div className="text-primary">{item.icon}</div>
                <div>
                  <p className="text-[10px] text-base-content/40 uppercase tracking-wider">{item.label}</p>
                  <p className="text-base-content text-sm font-medium">{item.value}</p>
                </div>
              </div>
            </a>
          ))}

          <div className="flex items-center gap-1.5 text-xs text-base-content/40 mt-2">
            <MapPin size={12} />
            <span>{profile.location} · {profile.openTo}</span>
          </div>

          <div className="card bg-primary/5 border border-primary/15 mt-2">
            <div className="card-body p-5">
              <h3 className="font-semibold text-base-content text-sm mb-3">Open to Opportunities</h3>
              <ul className="space-y-2">
                {[
                  "Senior Backend / AI Platform roles",
                  "ML Infrastructure & MLOps",
                  "Research Engineering",
                  "Technical Advisory / Consulting",
                  "Speaking Engagements",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-base-content/60 text-xs">
                    <span className="size-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Form column - wrapped in Suspense for useSearchParams */}
        <div className="lg:col-span-3">
          <Suspense fallback={<div className="skeleton h-96 w-full rounded-xl" />}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
